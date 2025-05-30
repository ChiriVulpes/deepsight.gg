import ansi from "ansicolor";
import * as fs from "fs-extra";
import * as https from "https";
import Env from "./utility/Env";
import FileHeader from "./utility/FileHeader";
import Log from "./utility/Log";
import Task from "./utility/Task";

interface Manifest {
	Response: {
		version: string;
		jsonWorldComponentContentPaths: {
			en: Record<string, string>;
		}
	}
}

export let DESTINY_MANIFEST_VERSION: string | undefined;

export default Task("destiny_manifest", async () => {
	if (Env.DEEPSIGHT_USE_EXISTING_MANIFEST)
		return Log.info("Using previous Destiny manifest due to DEEPSIGHT_USE_EXISTING_MANIFEST");

	let manifest: Manifest["Response"] | undefined;
	const maxAttempts = 10;
	for (let attempts = 0; !manifest && attempts < maxAttempts; attempts++) {
		const abortController = new AbortController();
		setTimeout(() => abortController.abort(), 20000); // 20 seconds max for a request
		manifest = await fetch("https://www.bungie.net/Platform/Destiny2/Manifest/", {
			headers: {
				"User-Agent": "deepsight.gg:build/0.0.0",
			},
			signal: abortController.signal,
		})
			.then(response => response.status === 200 ? response.json()
				: { type: "error", code: response.status, message: response.statusText })
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			.catch(err => ({ type: "error", message: err.message as string }))
			.then(json => {
				const manifest = (json as Manifest).Response;
				if (!manifest)
					Log.warn(`Bungie API did not return a valid manifest: ${JSON.stringify(json)}`);
				return (json as Manifest).Response;
			});

		if (!manifest)
			await new Promise(resolve => setTimeout(resolve, 1000));
	}

	const noSavedVersionString = "<no saved manifest>";
	const savedVersion = await fs.readFile("static/testiny/.v", "utf8").catch(() => noSavedVersionString);
	if (!manifest) {
		if (savedVersion === noSavedVersionString)
			throw new Error("Unable to fetch current Destiny manifest.");

		return Log.info("Using previous Destiny manifest.");
	}

	const bungieVersion = manifest.version;
	DESTINY_MANIFEST_VERSION = bungieVersion;
	if (bungieVersion === savedVersion)
		return;

	Log.info(`Bungie API is serving a new version of the Destiny manifest.\n    Old version: ${ansi.lightYellow(savedVersion)}\n    New version: ${ansi.lightBlue(bungieVersion)}`);

	await fs.mkdir("static/testiny").catch(() => { });

	for (const key of Object.keys(manifest.jsonWorldComponentContentPaths.en).sort((a, b) => a.localeCompare(b))) {
		let writeStream!: fs.WriteStream;
		let isValid = false;
		for (let attempt = 0; attempt < 5; attempt++) {
			Log.info(`Downloading manifest ${key}...`);
			const downloaded = await new Promise<boolean>(resolve => https
				.get(`https://www.bungie.net/${manifest!.jsonWorldComponentContentPaths.en[key]}`, {
					headers: {
						"User-Agent": "deepsight.gg:build/0.0.0",
					},
				}, response => response
					.pipe(writeStream = fs.createWriteStream(`static/testiny/${key}.json`))
					.on("finish", () => resolve(true))
					.on("error", () => resolve(false)))
				.on("error", () => resolve(false)));

			if (!downloaded) {
				Log.warn(`Failed to download manifest ${key}. Retrying...`);
				if (writeStream) {
					writeStream.close();
					if (!writeStream.writableFinished)
						await new Promise(resolve => writeStream?.on("finish", resolve));
				}
				continue;
			}

			if (await FileHeader.startsWith(`static/testiny/${key}.json`, "<!DOCTYPE")) {
				Log.warn(`Manifest ${key} is not valid JSON. Retrying...`);
				if (writeStream) {
					writeStream.close();
					if (!writeStream.writableFinished)
						await new Promise(resolve => writeStream?.on("finish", resolve));
				}
				continue;
			}

			isValid = true;
			break;
		}

		if (!isValid)
			throw new Error(`Failed to download manifest ${key} after 5 attempts.`);

		if (writeStream) {
			writeStream.close();
			if (!writeStream.writableFinished)
				await new Promise(resolve => writeStream?.on("finish", resolve));
		}
	}

	await fs.writeFile("static/testiny/.v", bungieVersion);
	Env.ENUMS_NEED_UPDATE = "true";

	Log.info("Manifest download complete.");
});

import ansi from "ansicolor";
import * as fs from "fs-extra";
import * as https from "https";
import Env from "./utility/Env";
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
		manifest = await fetch("https://www.bungie.net/Platform/Destiny2/Manifest/", { signal: abortController.signal })
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
		let writeStream: fs.WriteStream | undefined;
		do {
			Log.info(`Downloading manifest ${key}...`);
		} while (!await new Promise<boolean>(resolve => https
			.get(`https://www.bungie.net/${manifest!.jsonWorldComponentContentPaths.en[key]}`, response => response
				.pipe(writeStream = fs.createWriteStream(`static/testiny/${key}.json`))
				.on("finish", () => resolve(true))
				.on("error", () => resolve(false)))
			.on("error", () => resolve(false))));

		if (writeStream) {
			writeStream.close();
			if (!writeStream.writableFinished)
				await new Promise(resolve => writeStream?.on("finish", resolve));
		}
	}

	await fs.writeFile("static/testiny/.v", bungieVersion);

	Log.info("Manifest download complete.");
});

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import ansi from "ansicolor";
import fs from "fs-extra";
import { diff } from "json-diff";
import path from "path";
import { DESTINY_MANIFEST_VERSION } from "./destiny_manifest";
import Log from "./utilities/Log";
import Task from "./utilities/Task";

async function readData (file: string) {
	switch (path.extname(file)) {
		case ".json":
			return fs.readJson(file);
		case ".ts":
			return fs.readFile(file, "utf8")
				.then(contents => contents
					.replace(/\/\*.*?\*\//gs, "")
					.replace(/export declare const enum (\w+)|(\w+) =/g, "\"$1$2\":")
					.replace(/ =/g, ":")
					.replace(/(?<=})\n+(?=")/g, ",\n")
					.replace(/,(?=\n+})/g, ""))
				.then(jsonText => JSON.parse(`{${jsonText}}`));
	}
}

export default Task("bump_versions", async () => {
	if (!await fs.pathExists("manifest")) {
		if (process.env.DEEPSIGHT_ENVIRONMENT === "dev") {
			Log.info("Nothing to bump, no manifest output folder");
			return;
		}

		throw new Error("No output folder detected");
	}

	const versions = await fs.readJson("manifest/versions.json").catch(() => ({}));
	const files = await fs.readdir("docs/manifest");

	for (const file of files) {
		const newPath = `docs/manifest/${file}`;
		const oldPath = `manifest/${file}`;
		const jsonOld = await readData(oldPath).catch(() => undefined);
		const jsonNew = await readData(newPath);
		if (jsonOld && !diff(jsonOld, jsonNew))
			continue;

		await fs.copyFile(newPath, oldPath);
		const basename = path.basename(file, path.extname(file));
		versions[basename] = (versions[basename] ?? -1) + 1;
		Log.info(`Bumped ${ansi.lightGreen(file)} version`);
	}

	versions["Destiny2/Manifest"] = DESTINY_MANIFEST_VERSION;
	await fs.writeJson("manifest/versions.json", versions, { spaces: "\t" });
});

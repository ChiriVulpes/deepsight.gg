/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import ansi from "ansicolor";
import fs from "fs-extra";
import { diff } from "json-diff";
import path from "path";
import { DESTINY_MANIFEST_VERSION } from "./destiny_manifest";
import Hash from "./utilities/Hash";
import Log from "./utilities/Log";
import Task from "./utilities/Task";

async function readData (file: string) {
	switch (path.extname(file)) {
		case ".json":
			return fs.readJson(file);
		case ".ts": {
			const basename = path.basename(file);
			if (basename === "Enums.d.ts")
				return fs.readFile(file, "utf8")
					.then(contents => contents
						.replace(/\/\*.*?\*\//gs, "")
						.replace(/export declare const enum (\w+)|([$\w]+) =/g, "\"$1$2\":").replace(/ =/g, ":")
						.replace(/(?<=})\n+(?=")/g, ",\n")
						.replace(/,(?=\n+})/g, ""))
					.then(jsonText => JSON.parse(`{${jsonText}}`));

			return fs.readFile(file, "utf8");
		}
	}
}

export default Task("bump_versions", async () => {
	const isDev = process.env.DEEPSIGHT_ENVIRONMENT === "dev";
	if (!isDev && !await fs.pathExists("manifest"))
		throw new Error("No output folder detected");

	const versionsFilePath = `${isDev ? "docs/" : ""}manifest/versions.json`;
	const versions = await fs.readJson(versionsFilePath).catch(() => ({}));
	const files = await fs.readdir("docs/manifest");

	let bumped = false;
	const bumpMap: Record<string, true> = {};

	for (const file of files) {
		if (file === "versions.json")
			continue;

		const newPath = `docs/manifest/${file}`;
		if (!isDev) {
			const oldPath = `manifest/${file}`;
			const jsonOld = await readData(oldPath).catch(() => undefined);
			const jsonNew = await readData(newPath);
			if (jsonOld && (typeof jsonNew === "string" ? jsonOld === jsonNew : !diff(jsonOld, jsonNew)))
				continue;

			await fs.copyFile(newPath, oldPath);
		} else {
			if (!await Hash.fileChanged(newPath))
				continue;
		}

		let basename = path.basename(file, path.extname(file));
		basename = path.basename(basename, path.extname(basename));
		if (bumpMap[basename])
			continue;

		bumpMap[basename] = true;
		versions[basename] = (versions[basename] ?? -1) + 1;
		Log.info(`Bumped ${ansi.lightGreen(basename)} version`);
		bumped = true;
	}

	if (bumped)
		versions.deepsight = (versions.deepsight ?? -1) + 1;

	versions["Destiny2/Manifest"] = DESTINY_MANIFEST_VERSION;
	await fs.writeJson(versionsFilePath, versions, { spaces: "\t" });
});

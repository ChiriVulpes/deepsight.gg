import fs from "fs-extra";
import type { DeepsightWallpaperDefinition } from "../../static/manifest/Interfaces";
import JSON5 from "../utility/JSON5";
import Task from "../utility/Task";

export default Task("DeepsightWallpaperDefinition", async () => {
	const input = await JSON5.readFile<Record<number, string[]>>("static/manifest/DeepsightWallpaperDefinition.json5");
	const DeepsightWallpaperDefinition: Record<number, DeepsightWallpaperDefinition> = {};

	for (const [hashStr, value] of Object.entries(input)) {
		let hash = +hashStr;
		const isSecondary = !Number.isInteger(hash);
		if (isSecondary)
			hash = +hash.toFixed(0);

		const def = (DeepsightWallpaperDefinition[hash] ??= {
			hash,
			wallpapers: [],
			secondaryWallpapers: [],
		});

		def[isSecondary ? "secondaryWallpapers" : "wallpapers"].push(...value);
	}

	// clear empties
	for (const [hashStr, value] of Object.entries(DeepsightWallpaperDefinition))
		if (!value.wallpapers.length && !value.secondaryWallpapers.length)
			delete DeepsightWallpaperDefinition[+hashStr];

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightWallpaperDefinition.json", DeepsightWallpaperDefinition, { spaces: "\t" });
});

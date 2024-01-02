import fs from "fs-extra";
import JSON5 from "../utility/JSON5";
import Task from "../utility/Task";

export default Task("DeepsightWallpaperDefinition", async () => {
	const DeepsightWallpaperDefinition = await JSON5.readFile<Record<number, string[]>>("static/manifest/DeepsightWallpaperDefinition.json5");

	for (const [hash, value] of Object.entries(DeepsightWallpaperDefinition)) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		DeepsightWallpaperDefinition[+hash] = {
			hash: +hash,
			wallpapers: value,
		} as any;
	}

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightWallpaperDefinition.json", DeepsightWallpaperDefinition, { spaces: "\t" });
});

import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export interface DeepsightWallpaperDefinition {
	hash: number;
	data: string[];
}

export default new DeepsightEndpoint("DeepsightWallpaperDefinition.json", {
	process (received: Record<number, string[]>) {
		const result: Record<number, DeepsightWallpaperDefinition> = {};
		for (const [hash, wallpaper] of Object.entries(received))
			result[+hash] = { hash: +hash, data: wallpaper };
		return result;
	},
});

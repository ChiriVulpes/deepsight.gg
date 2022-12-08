import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export interface DestinyWallpaperDefinition {
	hash: number;
	data: string[];
}

export default new DeepsightEndpoint("DestinyWallpaperDefinition.json", {
	process (received: Record<number, string[]>) {
		const result: Record<number, DestinyWallpaperDefinition> = {};
		for (const [hash, wallpaper] of Object.entries(received))
			result[+hash] = { hash: +hash, data: wallpaper };
		return result;
	},
});

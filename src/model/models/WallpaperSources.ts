import Model from "model/Model";
import Manifest from "model/models/Manifest";
import type { DestinySourceDefinition } from "utility/endpoint/fvm/endpoint/GetDestinySourceDefinition";

export interface IWallpaperSource {
	wallpapers: string[];
	source: DestinySourceDefinition;
}

export default Model.createDynamic("Daily", async _ => Manifest.await()
	.then(async manifest => {
		const wallpaperSourcesRaw = await manifest.DestinyWallpaperDefinition.all();
		const sources = await manifest.DestinySourceDefinition.all();

		return wallpaperSourcesRaw.map((wallpaperSource): IWallpaperSource => ({
			wallpapers: wallpaperSource.data,
			source: sources.find(source => wallpaperSource.hash === source.hash)!,
		}))
			.sort((a, b) => +(a.source?.hash || 0) - +(b.source?.hash || 0));
	}));

export async function createWallpaperThumbnail (wallpaper: string) {
	const image = new Image();
	image.src = wallpaper;
	await new Promise(resolve => image.onload = resolve);

	const canvas = document.createElement("canvas");
	canvas.width = 144;
	canvas.height = 81;
	const context = canvas.getContext("2d")!;
	context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
	return canvas;
}

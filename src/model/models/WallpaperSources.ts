import Model from "model/Model";
import Manifest from "model/models/Manifest";
import type { DestinySourceDefinition } from "utility/endpoint/fvm/endpoint/GetDestinySourceDefinition";

export interface IWallpaperSource {
	wallpapers: string[];
	source: DestinySourceDefinition;
}

export default Model.createDynamic("Daily", async _ => Manifest.await()
	.then(async manifest => {
		const wallpaperSources = await manifest.DestinyWallpaperDefinition.all();
		const sources = await manifest.DestinySourceDefinition.all();
		return wallpaperSources.map(wallpaperSource => ({
			wallpapers: wallpaperSource.data,
			source: sources.find(source => wallpaperSource.hash === source.hash),
		})) as IWallpaperSource[];
	}));

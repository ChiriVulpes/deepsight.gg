import type { DestinySourceDefinition } from "utility/endpoint/deepsight/endpoint/GetDestinySourceDefinition";
import GetDestinySourceDefinition from "utility/endpoint/deepsight/endpoint/GetDestinySourceDefinition";
import type { DestinyWallpaperDefinition } from "utility/endpoint/deepsight/endpoint/GetDestinyWallpaperDefinition";
import GetDestinyWallpaperDefinition from "utility/endpoint/deepsight/endpoint/GetDestinyWallpaperDefinition";
import Endpoint from "utility/endpoint/Endpoint";

export interface AllCustomManifestComponents {
	DestinySourceDefinition: Record<number, DestinySourceDefinition>;
	DestinyWallpaperDefinition: Record<number, DestinyWallpaperDefinition>;
}

export default (new class extends Endpoint<AllCustomManifestComponents> {
	public constructor () {
		super("");
	}

	public override async query (): Promise<AllCustomManifestComponents> {
		return {
			DestinySourceDefinition: await GetDestinySourceDefinition.query(),
			DestinyWallpaperDefinition: await GetDestinyWallpaperDefinition.query(),
		};
	}
})

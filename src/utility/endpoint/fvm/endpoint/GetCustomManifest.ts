import Endpoint from "utility/endpoint/Endpoint";
import type { DestinySourceDefinition } from "utility/endpoint/fvm/endpoint/GetDestinySourceDefinition";
import GetDestinySourceDefinition from "utility/endpoint/fvm/endpoint/GetDestinySourceDefinition";
import type { DestinyWallpaperDefinition } from "utility/endpoint/fvm/endpoint/GetDestinyWallpaperDefinition";
import GetDestinyWallpaperDefinition from "utility/endpoint/fvm/endpoint/GetDestinyWallpaperDefinition";

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

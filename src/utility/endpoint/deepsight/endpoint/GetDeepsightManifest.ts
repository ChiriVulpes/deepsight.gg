import type { DeepsightCollectionsDefinition, DeepsightDropTableDefinition, DeepsightMomentDefinition, DeepsightTierTypeDefinition, DeepsightVendorDefinition, DeepsightWallpaperDefinition } from "@deepsight.gg/interfaces";
import type { DeepsightPlugCategorisation } from "@deepsight.gg/plugs";
import GetDeepsightCollectionsDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightCollectionsDefinition";
import GetDeepsightDropTableDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightDropTableDefinition";
import GetDeepsightMomentDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightMomentDefinition";
import GetDeepsightPlugCategorisation from "utility/endpoint/deepsight/endpoint/GetDeepsightPlugCategorisation";
import GetDeepsightTierTypeDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightTierTypeDefinition";
import GetDeepsightVendorDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightVendorDefinition";
import GetDeepsightWallpaperDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightWallpaperDefinition";
import Endpoint from "utility/endpoint/Endpoint";

export interface AllDeepsightManifestComponents {
	DeepsightMomentDefinition: Record<number, DeepsightMomentDefinition>;
	DeepsightWallpaperDefinition: Record<number, DeepsightWallpaperDefinition>;
	DeepsightDropTableDefinition: Record<number, DeepsightDropTableDefinition>;
	DeepsightPlugCategorisation: Record<number, DeepsightPlugCategorisation>;
	DeepsightTierTypeDefinition: Record<number, DeepsightTierTypeDefinition>;
	DeepsightVendorDefinition: Record<number, DeepsightVendorDefinition>;
	DeepsightCollectionsDefinition: Record<number, DeepsightCollectionsDefinition>;
}

export default (new class extends Endpoint<AllDeepsightManifestComponents> {
	public constructor () {
		super("");
	}

	public override async query (): Promise<AllDeepsightManifestComponents & { _headers: Headers }> {
		const result = {
			DeepsightMomentDefinition: await GetDeepsightMomentDefinition.query(),
			DeepsightWallpaperDefinition: await GetDeepsightWallpaperDefinition.query(),
			DeepsightDropTableDefinition: await GetDeepsightDropTableDefinition.query(),
			DeepsightPlugCategorisation: await GetDeepsightPlugCategorisation.query(),
			DeepsightTierTypeDefinition: await GetDeepsightTierTypeDefinition.query(),
			DeepsightVendorDefinition: await GetDeepsightVendorDefinition.query(),
			DeepsightCollectionsDefinition: await GetDeepsightCollectionsDefinition.query(),
		} as AllDeepsightManifestComponents as AllDeepsightManifestComponents & { _headers: Headers };

		Object.defineProperty(result, "_headers", {
			enumerable: false,
			get: () => new Headers(),
		});
		return result;
	}
});

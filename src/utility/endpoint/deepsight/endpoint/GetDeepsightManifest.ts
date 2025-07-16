import type { DeepsightAdeptDefinition, DeepsightBreakerSourceDefinition, DeepsightBreakerTypeDefinition, DeepsightCatalystDefinition, DeepsightCollectionsDefinition, DeepsightDropTableDefinition, DeepsightEmblemDefinition, DeepsightMomentDefinition, DeepsightSocketExtendedDefinition, DeepsightTierTypeDefinition, DeepsightWallpaperDefinition } from "@deepsight.gg/interfaces";
import type { DeepsightPlugCategorisation, DeepsightSocketCategorisationDefinition } from "@deepsight.gg/plugs";
import Endpoint from "utility/endpoint/Endpoint";
import GetDeepsightAdeptDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightAdeptDefinition";
import GetDeepsightBreakerSourceDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightBreakerSourceDefinition";
import GetDeepsightBreakerTypeDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightBreakerTypeDefinition";
import GetDeepsightCatalystDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightCatalystDefinition";
import GetDeepsightCollectionsDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightCollectionsDefinition";
import GetDeepsightDropTableDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightDropTableDefinition";
import GetDeepsightEmblemDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightEmblemDefinition";
import GetDeepsightMomentDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightMomentDefinition";
import GetDeepsightPlugCategorisation from "utility/endpoint/deepsight/endpoint/GetDeepsightPlugCategorisation";
import GetDeepsightSocketCategorisation from "utility/endpoint/deepsight/endpoint/GetDeepsightSocketCategorisation";
import GetDeepsightSocketExtendedDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightSocketExtendedDefinition";
import GetDeepsightTierTypeDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightTierTypeDefinition";
// import GetDeepsightVendorDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightVendorDefinition";
import GetDeepsightWallpaperDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightWallpaperDefinition";

export interface AllDeepsightManifestComponents {
	DeepsightMomentDefinition: Record<number, DeepsightMomentDefinition>;
	DeepsightWallpaperDefinition: Record<number, DeepsightWallpaperDefinition>;
	DeepsightDropTableDefinition: Record<number, DeepsightDropTableDefinition>;
	DeepsightPlugCategorisation: Record<number, DeepsightPlugCategorisation>;
	DeepsightSocketCategorisation: Record<number, DeepsightSocketCategorisationDefinition>;
	DeepsightTierTypeDefinition: Record<number, DeepsightTierTypeDefinition>;
	// DeepsightVendorDefinition: Record<number, DeepsightVendorDefinition>;
	DeepsightCollectionsDefinition: Record<number, DeepsightCollectionsDefinition>;
	DeepsightAdeptDefinition: Record<number, DeepsightAdeptDefinition>;
	DeepsightEmblemDefinition: Record<number, DeepsightEmblemDefinition>;
	DeepsightSocketExtendedDefinition: Record<number, DeepsightSocketExtendedDefinition>;
	DeepsightCatalystDefinition: Record<number, DeepsightCatalystDefinition>;
	DeepsightBreakerTypeDefinition: Record<number, DeepsightBreakerTypeDefinition>;
	DeepsightBreakerSourceDefinition: Record<number, DeepsightBreakerSourceDefinition>;
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
			DeepsightSocketCategorisation: await GetDeepsightSocketCategorisation.query(),
			DeepsightTierTypeDefinition: await GetDeepsightTierTypeDefinition.query(),
			// DeepsightVendorDefinition: await GetDeepsightVendorDefinition.query(),
			DeepsightCollectionsDefinition: await GetDeepsightCollectionsDefinition.query(),
			DeepsightAdeptDefinition: await GetDeepsightAdeptDefinition.query(),
			DeepsightEmblemDefinition: await GetDeepsightEmblemDefinition.query(),
			DeepsightSocketExtendedDefinition: await GetDeepsightSocketExtendedDefinition.query(),
			DeepsightCatalystDefinition: await GetDeepsightCatalystDefinition.query(),
			DeepsightBreakerTypeDefinition: await GetDeepsightBreakerTypeDefinition.query(),
			DeepsightBreakerSourceDefinition: await GetDeepsightBreakerSourceDefinition.query(),
		} as AllDeepsightManifestComponents as AllDeepsightManifestComponents & { _headers: Headers };

		Object.defineProperty(result, "_headers", {
			enumerable: false,
			get: () => new Headers(),
		});
		return result;
	}
});

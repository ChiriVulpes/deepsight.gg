import type { DeepsightDropTableDefinition, DeepsightMomentDefinition, DeepsightWallpaperDefinition } from "manifest.deepsight.gg";
import type { DeepsightPlugCategorisation } from "manifest.deepsight.gg/plugs";
import GetDeepsightDropTableDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightDropTableDefinition";
import GetDeepsightMomentDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightMomentDefinition";
import GetDeepsightPlugCategorisation from "utility/endpoint/deepsight/endpoint/GetDeepsightPlugCategorisation";
import GetDeepsightWallpaperDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightWallpaperDefinition";
import Endpoint from "utility/endpoint/Endpoint";

export interface AllDeepsightManifestComponents {
	DeepsightMomentDefinition: Record<number, DeepsightMomentDefinition>;
	DeepsightWallpaperDefinition: Record<number, DeepsightWallpaperDefinition>;
	DeepsightDropTableDefinition: Record<number, DeepsightDropTableDefinition>;
	DeepsightPlugCategorisation: Record<number, DeepsightPlugCategorisation>;
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
		} as AllDeepsightManifestComponents as AllDeepsightManifestComponents & { _headers: Headers };

		Object.defineProperty(result, "_headers", {
			enumerable: false,
			get: () => new Headers(),
		});
		return result;
	}
});

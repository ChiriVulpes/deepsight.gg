import type { DeepsightSourceDefinition } from "utility/endpoint/deepsight/endpoint/GetDeepsightSourceDefinition";
import GetDeepsightSourceDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightSourceDefinition";
import type { DeepsightWallpaperDefinition } from "utility/endpoint/deepsight/endpoint/GetDeepsightWallpaperDefinition";
import GetDeepsightWallpaperDefinition from "utility/endpoint/deepsight/endpoint/GetDeepsightWallpaperDefinition";
import Endpoint from "utility/endpoint/Endpoint";

export interface AllDeepsightManifestComponents {
	DeepsightSourceDefinition: Record<number, DeepsightSourceDefinition>;
	DeepsightWallpaperDefinition: Record<number, DeepsightWallpaperDefinition>;
}

export default (new class extends Endpoint<AllDeepsightManifestComponents> {
	public constructor () {
		super("");
	}

	public override async query (): Promise<AllDeepsightManifestComponents & { _headers: Headers }> {
		const result = {
			DeepsightSourceDefinition: await GetDeepsightSourceDefinition.query(),
			DeepsightWallpaperDefinition: await GetDeepsightWallpaperDefinition.query(),
		} as AllDeepsightManifestComponents as AllDeepsightManifestComponents & { _headers: Headers };

		Object.defineProperty(result, "_headers", {
			enumerable: false,
			get: () => new Headers(),
		});
		return result;
	}
})

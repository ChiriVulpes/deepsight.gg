import type { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import type Model from "model/Model";
import type { ManifestCache } from "model/models/Manifest";
import type { AllClarityDatabaseComponents } from "utility/endpoint/clarity/endpoint/GetClarityDatabase";
import type { AllDeepsightManifestComponents } from "utility/endpoint/deepsight/endpoint/GetDeepsightManifest";

export namespace IManifest {
	export function elapsed (elapsed: number) {
		if (elapsed < 1)
			return `${Math.floor(elapsed * 1_000)} μs`

		if (elapsed < 1_000)
			return `${Math.floor(elapsed)} ms`;

		if (elapsed < 60_000)
			return `${+(elapsed / 1_000).toFixed(2)} s`;

		return `${+(elapsed / 60_000).toFixed(2)} m`;
	}

	export type BaseComponentNames = keyof AllDestinyManifestComponents | keyof AllDeepsightManifestComponents;
	export type AllComponentNames = BaseComponentNames | keyof AllClarityDatabaseComponents;

	export namespace CacheComponentKey {
		export function get<COMPONENT_NAME extends AllComponentNames> (componentName: COMPONENT_NAME) {
			return `manifest [${componentName}]` as const;
		}
	}

	export const MANIFEST_CACHE_MODEL_KEY = "manifest cache";

	export let ManifestCacheModel: Model<ManifestCache> | undefined;
}

import type { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import { ClarityManifest } from "model/models/manifest/ClarityManifest";
import { DeepsightManifest } from "model/models/manifest/DeepsightManifest";
import DestinyManifest from "model/models/manifest/DestinyManifest";
import type { ManifestItem } from "model/models/manifest/IManifest";
import { IManifest } from "model/models/manifest/IManifest";
import type { AllClarityDatabaseComponents } from "utility/endpoint/clarity/endpoint/GetClarityDatabase";
import type { AllDeepsightManifestComponents } from "utility/endpoint/deepsight/endpoint/GetDeepsightManifest";

let manifestCacheState: boolean | undefined;

IManifest.ManifestCacheModel = Model.create(IManifest.MANIFEST_CACHE_MODEL_KEY, {
	cache: "Global",
	generate: async () => {
		const manifest = await DestinyManifest.await();
		const clarityManifest = await ClarityManifest.await();

		return Object.fromEntries(([] as [string, ManifestItem<IManifest.AllComponentNames>][])
			.concat(Object.entries(manifest)
				.map(([componentName, manifestItem]) => [componentName, manifestItem.createCache()]))
			.concat(Object.entries(clarityManifest)
				.map(([componentName, manifestItem]) => [componentName, manifestItem.createCache()]))) as any as IManifest.ManifestCache;
	},
});


IManifest.loadCache = async function loadCache () {
	if (manifestCacheState !== undefined) return;

	manifestCacheState = false;
	console.debug("Loading manifest cache");
	const manifestCache = await IManifest.ManifestCacheModel?.await() ?? {};
	const destinyManifest = await DestinyManifest.await();
	const deepsightManifest = await DeepsightManifest.await();
	const clarityManifest = await ClarityManifest.await();
	for (const [componentName, manifestItemCache] of Object.entries(manifestCache) as [IManifest.AllComponentNames, IManifest.ManifestItemCache][]) {
		(destinyManifest[componentName as keyof AllDestinyManifestComponents] as ManifestItem<keyof AllDestinyManifestComponents>)?.updateCache(manifestItemCache as IManifest.ManifestItemCache<keyof AllDestinyManifestComponents>);
		(deepsightManifest[componentName as keyof AllDeepsightManifestComponents] as ManifestItem<keyof AllDeepsightManifestComponents>)?.updateCache(manifestItemCache as IManifest.ManifestItemCache<keyof AllDeepsightManifestComponents>);
		(clarityManifest[componentName as keyof AllClarityDatabaseComponents])?.updateCache(manifestItemCache as IManifest.ManifestItemCache<keyof AllClarityDatabaseComponents>);
	}

	manifestCacheState = true;
	IManifest.setLoadedManifestCache();
	console.debug("Loaded manifest cache");
};

const Manifest = Model.createTemporary(async api => {
	const destinyManifest = await api.subscribeProgressAndWait(DestinyManifest, 1 / 3);
	const deepsightManifest = await api.subscribeProgressAndWait(DeepsightManifest, 1 / 3, 1 / 3);
	const clarityManifest = await api.subscribeProgressAndWait(ClarityManifest, 1 / 3, 2 / 3);
	return {
		...destinyManifest,
		...deepsightManifest,
		...clarityManifest,
	}
});

type Manifest = {
	[COMPONENT_NAME in keyof AllDestinyManifestComponents | keyof AllDeepsightManifestComponents | keyof AllClarityDatabaseComponents]: ManifestItem<COMPONENT_NAME>;
};

export default Manifest;

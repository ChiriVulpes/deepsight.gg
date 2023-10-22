import Model from "model/Model";
import { ClarityManifest } from "model/models/manifest/ClarityManifest";
import DestinyManifest from "model/models/manifest/DestinyManifest";
import type { ManifestItem } from "model/models/manifest/IManifest";
import { IManifest } from "model/models/manifest/IManifest";
import type { AllClarityDatabaseComponents } from "utility/endpoint/clarity/endpoint/GetClarityDatabase";

export class ManifestManager {

	private static manifestCacheState?: boolean;

	public static initialise () {
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
			if (ManifestManager.manifestCacheState !== undefined) return;

			ManifestManager.manifestCacheState = false;
			console.debug("Loading manifest cache");
			const manifestCache = await IManifest.ManifestCacheModel?.await() ?? {};
			const manifest = await DestinyManifest.await();
			const clarityManifest = await ClarityManifest.await();
			for (const [componentName, manifestItemCache] of Object.entries(manifestCache) as [IManifest.AllComponentNames, IManifest.ManifestItemCache][]) {
				(manifest[componentName as IManifest.BaseComponentNames] as ManifestItem<IManifest.BaseComponentNames>)?.updateCache(manifestItemCache as IManifest.ManifestItemCache<IManifest.BaseComponentNames>);
				(clarityManifest[componentName as keyof AllClarityDatabaseComponents])?.updateCache(manifestItemCache as IManifest.ManifestItemCache<keyof AllClarityDatabaseComponents>);
			}

			ManifestManager.manifestCacheState = true;
			IManifest.setLoadedManifestCache();
			console.debug("Loaded manifest cache");
		};

	}
}

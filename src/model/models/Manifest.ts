import type { AllDestinyManifestComponents, DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import { ClarityManifest } from "model/models/manifest/ClarityManifest";
import { IManifest, ManifestItem } from "model/models/manifest/IManifest";
import GetManifest from "utility/endpoint/bungie/endpoint/destiny2/GetManifest";
import type { AllClarityDatabaseComponents } from "utility/endpoint/clarity/endpoint/GetClarityDatabase";
import type { AllDeepsightManifestComponents } from "utility/endpoint/deepsight/endpoint/GetDeepsightManifest";
import GetCustomManifest from "utility/endpoint/deepsight/endpoint/GetDeepsightManifest";
import type { DestinySourceDefinition } from "utility/endpoint/deepsight/endpoint/GetDestinySourceDefinition";
import Env from "utility/Env";

const elapsed = IManifest.elapsed;
const CacheComponentKey = IManifest.CacheComponentKey;

declare module "bungie-api-ts/destiny2" {
	interface DestinyRecordDefinition {
		recordTypeName?: string;
	}
}

declare module "model/ModelCacheDatabase" {
	interface IModelCache extends IManifest.IModelCacheManifestComponents { }
}

type Manifest = {
	[COMPONENT_NAME in IManifest.BaseComponentNames]: ManifestItem<COMPONENT_NAME>;
};

interface ManifestModel<MANIFEST> extends Model<MANIFEST> {
	loadCache (): Promise<void>;
}

const Manifest = Model.create("manifest", {
	cache: "Global",
	version: async () => {
		const manifest = await GetManifest.query();
		return `${manifest.version}-13.deepsight.gg`;
	},
	async generate (api) {
		await ManifestCacheModel.reset();

		const manifest = await GetManifest.query();
		const bungieComponentNames = Object.keys(manifest.jsonWorldComponentContentPaths.en) as IManifest.BaseComponentNames[];

		const deepsightComponents = await GetCustomManifest.query();
		const deepsightComponentNames = Object.keys(deepsightComponents) as (keyof AllDeepsightManifestComponents)[];

		const sources = Object.values(deepsightComponents.DestinySourceDefinition);
		const sourcesRequiringWatermarks = Object.fromEntries(sources.filter(source => source.iconWatermark && typeof source.iconWatermark !== "string")
			.map(source => [(source.iconWatermark as { item: number }).item, source]));
		const sourcesRequiringShelvedWatermarks = Object.fromEntries(sources.filter(source => source.iconWatermarkShelved && typeof source.iconWatermarkShelved !== "string")
			.map(source => [(source.iconWatermarkShelved as { item: number }).item, source]));

		const allComponentNames = [...bungieComponentNames, ...deepsightComponentNames];

		const totalLoad = allComponentNames.length * 2 + 1;

		api.emitProgress(0, "Allocating stores for manifest");
		const cacheKeys = allComponentNames.map(CacheComponentKey.get);

		await Model.cacheDB.upgrade((database, transaction) => {
			for (const cacheKey of cacheKeys) {
				if (database.objectStoreNames.contains(cacheKey))
					database.deleteObjectStore(cacheKey);

				const store = database.createObjectStore(cacheKey);

				switch (cacheKey) {
					case "manifest [DestinySourceDefinition]":
						if (!store.indexNames.contains("iconWatermark"))
							store.createIndex("iconWatermark", "iconWatermark");
						if (!store.indexNames.contains("id"))
							store.createIndex("id", "id", { unique: true });
						break;
					case "manifest [DestinyInventoryItemDefinition]":
						if (!store.indexNames.contains("iconWatermark"))
							store.createIndex("iconWatermark", "iconWatermark");
						break;
					case "manifest [DestinyRecordDefinition]":
						if (!store.indexNames.contains("icon"))
							store.createIndex("icon", "displayProperties.icon");
						if (!store.indexNames.contains("name"))
							store.createIndex("name", "displayProperties.name");
						break;
				}
			}
		});

		for (let i = 0; i < bungieComponentNames.length; i++) {
			const componentName = bungieComponentNames[i];
			const cacheKey = CacheComponentKey.get(componentName);

			let startTime = performance.now();
			console.info(`Downloading ${cacheKey}`);
			api.emitProgress((1 + i * 2) / totalLoad, "Downloading manifest");

			let data: AllDestinyManifestComponents[keyof AllDestinyManifestComponents];
			let tryAgain = true;
			for (let i = 0; i < 5 && tryAgain; i++) {
				tryAgain = false;
				data = await fetch(Env.DEEPSIGHT_ENVIRONMENT === "dev" ? `testiny/${componentName}.json` : `https://www.bungie.net${manifest.jsonWorldComponentContentPaths.en[componentName]}?corsfix=${i}`)
					.then(response => response.json())
					.catch(err => {
						if ((err as Error).message.includes("Access-Control-Allow-Origin")) {
							console.warn(`CORS error, trying again with a query string (attempt ${++i})`);
							tryAgain = true;
							return {};
						}

						throw err;
					}) as AllDestinyManifestComponents[keyof AllDestinyManifestComponents];
			}

			console.info(`Finished downloading ${cacheKey} after ${elapsed(performance.now() - startTime)}`);
			startTime = performance.now();
			console.info(`Storing objects from ${cacheKey}`);
			api.emitProgress((1 + i * 2 + 1) / totalLoad, "Storing manifest");

			await Model.cacheDB.transaction([cacheKey], async transaction => {
				await transaction.clear(cacheKey);

				for (const key of Object.keys(data)) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
					const definition = (data as any)[key];

					if (cacheKey === "manifest [DestinyInventoryItemDefinition]") {
						const itemDef = definition as DestinyInventoryItemDefinition;
						const source = sourcesRequiringWatermarks[key];
						if (source)
							source.iconWatermark = itemDef.iconWatermark
								?? itemDef.quality?.displayVersionWatermarkIcons?.[0]
								?? itemDef.iconWatermarkShelved;

						const shelvedSource = sourcesRequiringShelvedWatermarks[key];
						if (shelvedSource)
							shelvedSource.iconWatermarkShelved = itemDef.iconWatermarkShelved
								?? itemDef.quality?.displayVersionWatermarkIcons?.[0]
								?? itemDef.iconWatermark;
					}

					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					await transaction.set(cacheKey, key, definition);
				}
			});

			console.info(`Finished caching objects from ${cacheKey} after ${elapsed(performance.now() - startTime)}`);
		}

		const replaceWatermarksByItemHash: Record<number, DestinySourceDefinition> =
			Object.fromEntries(sources.flatMap(source => (source.itemHashes ?? [])
				.map(itemHash => [itemHash, source])));

		await Model.cacheDB.transaction(deepsightComponentNames.map(CacheComponentKey.get), async transaction => {
			for (let i = 0; i < deepsightComponentNames.length; i++) {
				const componentName = deepsightComponentNames[i];
				const cacheKey = CacheComponentKey.get(componentName);

				const startTime = performance.now();
				console.info(`Caching objects from ${cacheKey}`);
				api.emitProgress((1 + bungieComponentNames.length * 2 + i) / totalLoad, "Storing manifest");

				await transaction.clear(cacheKey);

				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				for (const [itemId, itemValue] of Object.entries(deepsightComponents[componentName])) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					await transaction.set(cacheKey, itemId, itemValue);
				}

				console.info(`Finished caching objects from ${cacheKey} after ${elapsed(performance.now() - startTime)}`);
			}
		});

		await Model.cacheDB.transaction(["manifest [DestinyInventoryItemDefinition]"], async transaction => {
			const startTime = performance.now();
			console.info("Updating item watermarks");

			for (const item of await transaction.all("manifest [DestinyInventoryItemDefinition]")) {
				// fix red war items that don't have watermarks for some reason
				const replacementSource = replaceWatermarksByItemHash[item.hash];
				if (replacementSource) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					(item as any).iconWatermark = replacementSource.iconWatermark;
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					(item as any).iconWatermarkShelved = replacementSource.iconWatermarkShelved;
				} else if (!item.iconWatermark && item.quality?.displayVersionWatermarkIcons.length) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					(item as any).iconWatermark = item.quality.displayVersionWatermarkIcons[0];
				}

				await transaction.set("manifest [DestinyInventoryItemDefinition]", `${item.hash}`, item);
			}

			console.info(`Finished updating item watermarks after ${elapsed(performance.now() - startTime)}`);
		});

		return allComponentNames;
	},
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	process: componentNames => (window as any).Manifest = Object.fromEntries(componentNames
		.map(componentName => [componentName, new ManifestItem(CacheComponentKey.get(componentName))])) as any as Manifest,
	reset: async componentNames => {
		if (componentNames)
			for (const componentName of componentNames)
				await Model.cacheDB.clear(CacheComponentKey.get(componentName));

		await Model.cacheDB.delete("models", IManifest.MANIFEST_CACHE_MODEL_KEY);
	},
}) as any as ManifestModel<Manifest>;

export default Manifest;

const ManifestCacheModel = IManifest.ManifestCacheModel = Model.create(IManifest.MANIFEST_CACHE_MODEL_KEY, {
	cache: "Global",
	generate: async () => {
		const manifest = await Manifest.await();
		const clarityManifest = await ClarityManifest.await();

		return Object.fromEntries(([] as [string, ManifestItem<IManifest.AllComponentNames>][])
			.concat(Object.entries(manifest)
				.map(([componentName, manifestItem]) => [componentName, manifestItem.createCache()]))
			.concat(Object.entries(clarityManifest)
				.map(([componentName, manifestItem]) => [componentName, manifestItem.createCache()]))) as any as IManifest.ManifestCache;
	},
});

let manifestCacheState: boolean | undefined;
Manifest.loadCache = IManifest.loadCache = async function loadCache () {
	if (manifestCacheState !== undefined) return;

	manifestCacheState = false;
	console.debug("Loading manifest cache");
	const manifestCache = await ManifestCacheModel?.await();
	const manifest = await Manifest.await();
	const clarityManifest = await ClarityManifest.await();
	for (const [componentName, manifestItemCache] of Object.entries(manifestCache) as [IManifest.AllComponentNames, IManifest.ManifestItemCache][]) {
		(manifest[componentName as IManifest.BaseComponentNames] as ManifestItem<IManifest.BaseComponentNames>)?.updateCache(manifestItemCache as IManifest.ManifestItemCache<IManifest.BaseComponentNames>);
		(clarityManifest[componentName as keyof AllClarityDatabaseComponents])?.updateCache(manifestItemCache as IManifest.ManifestItemCache<keyof AllClarityDatabaseComponents>);
	}

	manifestCacheState = true;
	IManifest.setLoadedManifestCache();
	console.debug("Loaded manifest cache");
};

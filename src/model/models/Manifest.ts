import type { AllDestinyManifestComponents, DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import type { IModelCache } from "model/ModelCacheDatabase";
import { ClarityManifest } from "model/models/manifest/ClarityManifest";
import { IManifest } from "model/models/manifest/IManifest";
import type Database from "utility/Database";
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

type Indices<COMPONENT_NAME extends IManifest.AllComponentNames> =
	{
		DestinySourceDefinition: "iconWatermark" | "id";
		DestinyInventoryItemDefinition: "iconWatermark";
		DestinyRecordDefinition: "icon" | "name";
	} extends infer ALL_INDICES ?
	ALL_INDICES[COMPONENT_NAME & keyof ALL_INDICES]
	: never;

type Component<COMPONENT_NAME extends IManifest.AllComponentNames> =
	(AllDestinyManifestComponents & AllDeepsightManifestComponents & AllClarityDatabaseComponents)[COMPONENT_NAME][number];

type ComponentKey<COMPONENT_NAME extends IManifest.AllComponentNames = IManifest.AllComponentNames> =
	`manifest [${COMPONENT_NAME}]`;

type IModelCacheManifestComponents =
	{ [COMPONENT_NAME in IManifest.AllComponentNames as ComponentKey<COMPONENT_NAME>]: Component<COMPONENT_NAME> };

declare module "model/ModelCacheDatabase" {
	interface IModelCache extends IModelCacheManifestComponents { }
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

export type ManifestCache = { [COMPONENT_NAME in IManifest.AllComponentNames]: ManifestItemCache };

const ManifestCacheModel = IManifest.ManifestCacheModel = Model.create(IManifest.MANIFEST_CACHE_MODEL_KEY, {
	cache: "Global",
	generate: async () => {
		const manifest = await Manifest.await();
		const clarityManifest = await ClarityManifest.await();

		return Object.fromEntries(([] as [string, ManifestItem<IManifest.AllComponentNames>][])
			.concat(Object.entries(manifest)
				.map(([componentName, manifestItem]) => [componentName, manifestItem.createCache()]))
			.concat(Object.entries(clarityManifest)
				.map(([componentName, manifestItem]) => [componentName, manifestItem.createCache()]))) as any as ManifestCache;
	},
});

let manifestCacheUpdateTimeout: number;
function updateManifestCache () {
	clearTimeout(manifestCacheUpdateTimeout);
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	manifestCacheUpdateTimeout = window.setTimeout(async () => {
		await ManifestCacheModel.reset()
		await ManifestCacheModel.await();
	}, 1000);
}

type ManifestItemCache<COMPONENT_NAME extends IManifest.AllComponentNames = IManifest.AllComponentNames> = Record<string, Component<COMPONENT_NAME> | Promise<Component<COMPONENT_NAME> | undefined> | undefined>;

let manifestCacheState: boolean | undefined;
let setLoadedManifestCache: () => void;
const loadedManifestCache = new Promise<void>(resolve => setLoadedManifestCache = resolve);
Manifest.loadCache = async () => {
	if (manifestCacheState !== undefined) return;

	manifestCacheState = false;
	console.debug("Loading manifest cache");
	const manifestCache = await ManifestCacheModel.await();
	const manifest = await Manifest.await();
	const clarityManifest = await ClarityManifest.await();
	for (const [componentName, manifestItemCache] of Object.entries(manifestCache) as [IManifest.AllComponentNames, ManifestItemCache][]) {
		(manifest[componentName as IManifest.BaseComponentNames] as ManifestItem<IManifest.BaseComponentNames>)?.updateCache(manifestItemCache as ManifestItemCache<IManifest.BaseComponentNames>);
		(clarityManifest[componentName as keyof AllClarityDatabaseComponents])?.updateCache(manifestItemCache as ManifestItemCache<keyof AllClarityDatabaseComponents>);
	}

	manifestCacheState = true;
	setLoadedManifestCache();
	console.debug("Loaded manifest cache");
};

export class ManifestItem<COMPONENT_NAME extends IManifest.AllComponentNames> {

	private memoryCache: ManifestItemCache<COMPONENT_NAME> = {};

	private readonly stagedTransaction: Database.StagedTransaction<Pick<IModelCache, ComponentKey<COMPONENT_NAME>>, [ComponentKey<COMPONENT_NAME>]>;

	public constructor (private readonly componentName: ComponentKey<COMPONENT_NAME>) {
		this.stagedTransaction = Model.cacheDB.stagedTransaction([componentName]);
	}

	public get (key?: string | number | null, cached?: boolean): Component<COMPONENT_NAME> | Promise<Component<COMPONENT_NAME>> | undefined;
	public get (index: Indices<COMPONENT_NAME>, key: string | number | null, cached?: boolean): Component<COMPONENT_NAME> | Promise<Component<COMPONENT_NAME>> | undefined;
	public get (index?: string | number | null, key?: string | number | null | boolean, cached = true): any {
		if (typeof key === "boolean")
			cached = key, key = undefined;

		if (key === undefined)
			key = index, index = undefined;

		if (key === undefined || key === null)
			return undefined;

		const memoryCacheKey = `${index ?? "/"}:${key}`;
		if (this.memoryCache[memoryCacheKey])
			return this.memoryCache[memoryCacheKey] ?? undefined;

		return this.resolve(memoryCacheKey, key, index, cached);
	}

	private async resolve (memoryCacheKey: string, key: string | number, index?: string | number | null, cached = true) {
		void Manifest.loadCache();
		await loadedManifestCache;

		if (memoryCacheKey in this.memoryCache)
			return this.memoryCache[memoryCacheKey] ?? undefined;

		const promise = this.stagedTransaction.get(this.componentName, `${key}`, index as string | undefined)
			.then(value => {
				if (cached) {
					this.memoryCache[memoryCacheKey] = value ?? null as never;
					updateManifestCache();
				}

				return value ?? undefined;
			});

		if (cached)
			this.memoryCache[memoryCacheKey] = promise;

		return promise;
	}

	public all (): Promise<Component<COMPONENT_NAME>[]>;
	public all (index: Indices<COMPONENT_NAME>, key: string | number | null): Promise<Component<COMPONENT_NAME>[]>;
	public all (index?: string, key?: string | number | null) {
		if (index)
			return this.stagedTransaction.all(this.componentName, `${key!}`, index);
		return this.stagedTransaction.all(this.componentName);
	}

	public createCache () {
		return JSON.parse(JSON.stringify(this.memoryCache));
	}

	public updateCache (value: ManifestItemCache<COMPONENT_NAME>) {
		this.memoryCache = value;
	}
}

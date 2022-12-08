import type { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import GetManifest from "utility/endpoint/bungie/endpoint/destiny2/GetManifest";
import type { AllCustomManifestComponents } from "utility/endpoint/deepsight/endpoint/GetCustomManifest";
import GetCustomManifest from "utility/endpoint/deepsight/endpoint/GetCustomManifest";
import Env from "utility/Env";

type Indices<COMPONENT_NAME extends AllComponentNames> =
	{
		DestinySourceDefinition: "iconWatermark" | "id";
		DestinyRecordDefinition: "icon" | "name";
	} extends infer ALL_INDICES ?
	ALL_INDICES[COMPONENT_NAME & keyof ALL_INDICES]
	: never;

type AllComponentNames = keyof AllDestinyManifestComponents | keyof AllCustomManifestComponents;
type Component<COMPONENT_NAME extends AllComponentNames> =
	(AllDestinyManifestComponents & AllCustomManifestComponents)[COMPONENT_NAME][number];

type ComponentKey<COMPONENT_NAME extends AllComponentNames = AllComponentNames> =
	`manifest [${COMPONENT_NAME}]`;

namespace CacheComponentKey {
	export function get<COMPONENT_NAME extends AllComponentNames> (componentName: COMPONENT_NAME) {
		return `manifest [${componentName}]` as const;
	}
}

type IModelCacheManifestComponents =
	{ [COMPONENT_NAME in AllComponentNames as ComponentKey<COMPONENT_NAME>]: Component<COMPONENT_NAME> };

declare module "model/ModelCacheDatabase" {
	interface IModelCache extends IModelCacheManifestComponents { }
}

function elapsed (elapsed: number) {
	if (elapsed < 1)
		return `${Math.floor(elapsed * 1_000)} μs`

	if (elapsed < 1_000)
		return `${Math.floor(elapsed)} ms`;

	if (elapsed < 60_000)
		return `${+(elapsed / 1_000).toFixed(2)} s`;

	return `${+(elapsed / 60_000).toFixed(2)} m`;
}

export type Manifest = {
	[COMPONENT_NAME in AllComponentNames]: ManifestItem<COMPONENT_NAME>;
};

const manifestCacheModelKey = "manifest cache";

const Manifest = Model.create("manifest", {
	cache: "Global",
	version: async () => {
		const manifest = await GetManifest.query();
		return `${manifest.version}-3.deepsight.gg`;
	},
	async generate (api) {
		const manifest = await GetManifest.query();
		const bungieComponentNames = Object.keys(manifest.jsonWorldComponentContentPaths.en) as AllComponentNames[];

		const customComponents = await GetCustomManifest.query();
		const customComponentNames = Object.keys(customComponents) as (keyof AllCustomManifestComponents)[];

		const allComponentNames = [...bungieComponentNames, ...customComponentNames];

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

			const data = await fetch(Env.DEEPSIGHT_ENVIRONMENT === "dev" ? `testiny/${componentName}.json` : `https://www.bungie.net${manifest.jsonWorldComponentContentPaths.en[componentName]}`)
				.then(response => response.json())
				.catch(err => {
					if ((err as Error).message.includes("Access-Control-Allow-Origin")) {
						console.warn(err);
						return {};
					}

					throw err;
				}) as AllDestinyManifestComponents[keyof AllDestinyManifestComponents];

			console.info(`Finished downloading ${cacheKey} after ${elapsed(performance.now() - startTime)}`);
			startTime = performance.now();
			console.info(`Storing objects from ${cacheKey}`);
			api.emitProgress((1 + i * 2 + 1) / totalLoad, "Storing manifest");

			await Model.cacheDB.transaction([cacheKey], async transaction => {
				await transaction.clear(cacheKey);

				for (const key of Object.keys(data)) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
					await transaction.set(cacheKey, key, (data as any)[key]);
				}
			});

			console.info(`Finished caching objects from ${cacheKey} after ${elapsed(performance.now() - startTime)}`);
		}

		await Model.cacheDB.transaction(customComponentNames.map(CacheComponentKey.get), async transaction => {
			for (let i = 0; i < customComponentNames.length; i++) {
				const componentName = customComponentNames[i];
				const cacheKey = CacheComponentKey.get(componentName);

				const startTime = performance.now();
				console.info(`Caching objects from ${cacheKey}`);
				api.emitProgress((1 + bungieComponentNames.length * 2 + i) / totalLoad, "Storing manifest");

				await transaction.clear(cacheKey);

				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				for (const [itemId, itemValue] of Object.entries(customComponents[componentName])) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					await transaction.set(cacheKey, itemId, itemValue);
				}

				console.info(`Finished caching objects from ${cacheKey} after ${elapsed(performance.now() - startTime)}`);
			}
		});

		return allComponentNames;
	},
	process: componentNames => Object.fromEntries(componentNames
		.map(componentName => [componentName, new ManifestItem(CacheComponentKey.get(componentName))])) as Manifest,
	reset: async componentNames => {
		if (componentNames)
			for (const componentName of componentNames)
				await Model.cacheDB.clear(CacheComponentKey.get(componentName));

		await Model.cacheDB.delete("models", manifestCacheModelKey);
	},
});

export default Manifest;

type ManifestCache = { [COMPONENT_NAME in AllComponentNames]: ManifestItemCache };

const ManifestCacheModel = Model.create(manifestCacheModelKey, {
	cache: "Global",
	generate: async () => {
		const manifest = await Manifest.await();

		return Object.fromEntries(Object.entries(manifest)
			.map(([componentName, manifestItem]) => [componentName, manifestItem.createCache()])) as ManifestCache;
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

type ManifestItemCache<COMPONENT_NAME extends AllComponentNames = AllComponentNames> = Record<string, Component<COMPONENT_NAME> | Promise<Component<COMPONENT_NAME> | undefined> | undefined>;

let setLoadedManifestCache: () => void;
let loadedManifestCache: Promise<void> | undefined;

export class ManifestItem<COMPONENT_NAME extends AllComponentNames> {

	private memoryCache: ManifestItemCache<COMPONENT_NAME> = {};

	public constructor (private readonly componentName: ComponentKey<COMPONENT_NAME>) { }

	public get (key?: string | number | null): Component<COMPONENT_NAME> | Promise<Component<COMPONENT_NAME>> | undefined;
	public get (index: Indices<COMPONENT_NAME>, key: string | number | null): Component<COMPONENT_NAME> | Promise<Component<COMPONENT_NAME>> | undefined;
	public get (index?: string | number | null, key?: string | number | null) {
		if (key === undefined)
			key = index, index = undefined;

		if (key === undefined || key === null)
			return undefined;

		const memoryCacheKey = `${index ?? "/"}:${key}`;
		if (this.memoryCache[memoryCacheKey])
			return this.memoryCache[memoryCacheKey];

		return this.resolve(memoryCacheKey, key, index);
	}

	private async resolve (memoryCacheKey: string, key: string | number, index?: string | number | null) {
		if (!loadedManifestCache) {
			loadedManifestCache = new Promise<void>(resolve => setLoadedManifestCache = resolve);
			const manifestCache = await ManifestCacheModel.await();
			const manifest = await Manifest.await();
			for (const [componentName, manifestItemCache] of Object.entries(manifestCache) as [AllComponentNames, ManifestItemCache][])
				(manifest[componentName] as ManifestItem<AllComponentNames>).updateCache(manifestItemCache);

			setLoadedManifestCache();
		}

		await loadedManifestCache;

		if (memoryCacheKey in this.memoryCache)
			return this.memoryCache[memoryCacheKey];

		return this.memoryCache[memoryCacheKey] = Model.cacheDB.get(this.componentName, `${key}`, index as string | undefined)
			.then(value => {
				updateManifestCache();
				return this.memoryCache[memoryCacheKey] = value;
			});
	}

	public all () {
		return Model.cacheDB.all(this.componentName);
	}

	public createCache () {
		return this.memoryCache;
	}

	public updateCache (value: ManifestItemCache<COMPONENT_NAME>) {
		this.memoryCache = value;
	}
}

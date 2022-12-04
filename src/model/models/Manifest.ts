import type { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import GetManifest from "utility/endpoint/bungie/endpoint/destiny2/GetManifest";
import type { AllCustomManifestComponents } from "utility/endpoint/fvm/endpoint/GetCustomManifest";
import GetCustomManifest from "utility/endpoint/fvm/endpoint/GetCustomManifest";

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

export class ManifestItem<COMPONENT_NAME extends AllComponentNames> {

	private memoryCache: Record<string, Component<COMPONENT_NAME> | Promise<Component<COMPONENT_NAME> | undefined> | undefined> = {};

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

		return this.memoryCache[memoryCacheKey] = Model.cacheDB.get(this.componentName, `${key}`, index as string | undefined)
			.then(value => this.memoryCache[memoryCacheKey] = value);
	}

	public all () {
		return Model.cacheDB.all(this.componentName);
	}
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

export default Model.create("manifest", {
	cache: "Global",
	version: async () => {
		const manifest = await GetManifest.query();
		return `${manifest.version}-3.fvm`;
	},
	async generate (api) {
		api.emitProgress(0, "Downloading manifest");

		const manifest = await GetManifest.query();
		const destinyComponents = await fetch(`https://www.bungie.net/${manifest.jsonWorldContentPaths.en}`)
			.then(response => response.json() as Promise<AllDestinyManifestComponents>);

		const customComponents = await GetCustomManifest.query();

		const components = { ...destinyComponents, ...customComponents };

		const componentNames = Object.keys(components) as AllComponentNames[];
		const totalLoad = componentNames.length + 1;

		api.emitProgress(1 / totalLoad, "Allocating stores for manifest");
		const cacheKeys = componentNames.map(CacheComponentKey.get);

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

		await Model.cacheDB.transaction(componentNames.map(CacheComponentKey.get), async transaction => {

			for (let i = 0; i < componentNames.length; i++) {
				const componentName = componentNames[i];
				const cacheKey = CacheComponentKey.get(componentName);

				const startTime = performance.now();
				console.info(`Caching objects from ${cacheKey}`);
				api.emitProgress((1 + i) / totalLoad, "Storing manifest");

				await transaction.clear(cacheKey);

				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				for (const [itemId, itemValue] of Object.entries(components[componentName])) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					await transaction.set(cacheKey, itemId, itemValue);
				}

				console.info(`Finished caching objects from ${cacheKey} after ${elapsed(performance.now() - startTime)}`);
			}
		});

		return componentNames;
	},
	filter: componentNames => Object.fromEntries(componentNames
		.map(componentName => [componentName, new ManifestItem(CacheComponentKey.get(componentName))])) as Manifest,
	reset: async componentNames => {
		if (componentNames)
			for (const componentName of componentNames)
				await Model.cacheDB.clear(CacheComponentKey.get(componentName));
	},
});

import type { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import GetManifest from "utility/bungie/endpoint/destiny2/GetManifest";

type ComponentKey<COMPONENT_NAME extends keyof AllDestinyManifestComponents = keyof AllDestinyManifestComponents> =
	`manifest [${COMPONENT_NAME}]`;

namespace CacheComponentKey {
	export function get<COMPONENT_NAME extends keyof AllDestinyManifestComponents> (componentName: COMPONENT_NAME) {
		return `manifest [${componentName}]` as const;
	}
}

type IModelCacheManifestComponents =
	{ [COMPONENT_NAME in keyof AllDestinyManifestComponents as ComponentKey<COMPONENT_NAME>]:
		AllDestinyManifestComponents[COMPONENT_NAME][number] };

declare module "model/ModelCacheDatabase" {
	interface IModelCache extends IModelCacheManifestComponents { }
}

class ManifestItem<COMPONENT_NAME extends keyof AllDestinyManifestComponents> {

	private memoryCache: Record<string, AllDestinyManifestComponents[COMPONENT_NAME][number] | Promise<AllDestinyManifestComponents[COMPONENT_NAME][number] | undefined> | undefined> = {};

	public constructor (private readonly componentName: ComponentKey<COMPONENT_NAME>) { }

	public get (key?: string | number) {
		if (key === undefined)
			return undefined;

		if (this.memoryCache[key])
			return this.memoryCache[key];

		return this.memoryCache[key] = Model.cacheDB.get(this.componentName, `${key}`)
			.then(value => this.memoryCache[key] = value);
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
	[COMPONENT_NAME in keyof AllDestinyManifestComponents]: ManifestItem<COMPONENT_NAME>;
};

export default Model.create("manifest", {
	cache: "Global",
	resetTime: "Daily",
	async generate () {
		const manifest = await GetManifest.query();
		const components = await fetch(`https://www.bungie.net/${manifest.jsonWorldContentPaths.en}`)
			.then(response => response.json() as Promise<AllDestinyManifestComponents>);

		const componentNames = Object.keys(components) as (keyof AllDestinyManifestComponents)[];

		const cacheKeys = componentNames.map(CacheComponentKey.get);
		if (!await Model.cacheDB.hasStore(...cacheKeys)) {
			await Model.cacheDB.upgrade(upgrade => {
				for (const cacheKey of cacheKeys) {
					upgrade.createObjectStore(cacheKey);
				}
			});
		}

		await Model.cacheDB.transaction(componentNames.map(CacheComponentKey.get), async transaction => {
			for (const componentName of componentNames) {
				const cacheKey = CacheComponentKey.get(componentName);

				const startTime = performance.now();
				console.info(`Caching objects from ${cacheKey}`);

				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				for (const [itemId, itemValue] of Object.entries(components[componentName])) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					await transaction.set(cacheKey, itemId, itemValue as any);
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

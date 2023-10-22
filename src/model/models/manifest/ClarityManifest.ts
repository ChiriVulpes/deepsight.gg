import Model from "model/Model";
import { IManifest, ManifestItem } from "model/models/manifest/IManifest";
import type { AllClarityDatabaseComponents } from "utility/endpoint/clarity/endpoint/GetClarityDatabase";
import GetClarityDatabase from "utility/endpoint/clarity/endpoint/GetClarityDatabase";
import GetClarityDatabaseVersions from "utility/endpoint/clarity/endpoint/GetClarityDatabaseVersions";

type ClarityManifest = {
	[COMPONENT_NAME in keyof AllClarityDatabaseComponents]: ManifestItem<COMPONENT_NAME>;
};

const ClarityManifest = Model.create("clarityDatabase", {
	cache: "Global",
	version: async () => {
		const versions = await GetClarityDatabaseVersions.query();
		return `${Object.entries(versions)
			.filter((entry): entry is [string, number] => typeof entry[1] === "number")
			.map(([name, version]) => `${name}.${version}`)
			.sort()
			.join(",")}-0.deepsight.gg`;
	},
	async generate (api) {
		await IManifest.ManifestCacheModel?.reset();

		const clarityComponents = await GetClarityDatabase.query();
		const clarityComponentNames = Object.keys(clarityComponents) as (keyof AllClarityDatabaseComponents)[];

		const cacheKeys = clarityComponentNames.map(IManifest.CacheComponentKey.get);

		await Model.cacheDB.upgrade((database, transaction) => {
			for (const cacheKey of cacheKeys) {
				if (database.objectStoreNames.contains(cacheKey))
					database.deleteObjectStore(cacheKey);

				database.createObjectStore(cacheKey);
			}
		});

		const totalLoad = clarityComponentNames.length;

		await Model.cacheDB.transaction(clarityComponentNames.map(IManifest.CacheComponentKey.get), async transaction => {
			for (let i = 0; i < clarityComponentNames.length; i++) {
				const componentName = clarityComponentNames[i];
				const cacheKey = IManifest.CacheComponentKey.get(componentName);

				const startTime = performance.now();
				console.info(`Caching objects from ${cacheKey}`);
				api.emitProgress(i / totalLoad, "Storing manifest");

				await transaction.clear(cacheKey);

				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				for (const [itemId, itemValue] of Object.entries(clarityComponents[componentName])) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					await transaction.set(cacheKey, itemId, itemValue);
				}

				console.info(`Finished caching objects from ${cacheKey} after ${IManifest.elapsed(performance.now() - startTime)}`);
			}
		});

		return clarityComponentNames;
	},
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	process: componentNames => (window as any).ClarityManifest = Object.fromEntries(componentNames
		.map(componentName => [componentName, new ManifestItem(IManifest.CacheComponentKey.get(componentName))])) as any as ClarityManifest,
	reset: async componentNames => {
		if (componentNames)
			for (const componentName of componentNames)
				await Model.cacheDB.clear(IManifest.CacheComponentKey.get(componentName));

		await Model.cacheDB.delete("models", IManifest.MANIFEST_CACHE_MODEL_KEY);
	},
});

export { ClarityManifest };


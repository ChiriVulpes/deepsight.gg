import Model from "model/Model";
import { IManifest, ManifestItem } from "model/models/manifest/IManifest";
import type { AllDeepsightManifestComponents } from "utility/endpoint/deepsight/endpoint/GetDeepsightManifest";
import GetDeepsightManifest from "utility/endpoint/deepsight/endpoint/GetDeepsightManifest";
import GetDeepsightManifestVersions from "utility/endpoint/deepsight/endpoint/GetDeepsightManifestVersions";

type DeepsightManifest = {
	[COMPONENT_NAME in keyof AllDeepsightManifestComponents]: ManifestItem<COMPONENT_NAME>;
};

const DeepsightManifest = Model.create("deepsight manifest", {
	cache: "Global",
	version: async () => {
		const versions = await GetDeepsightManifestVersions.query();
		return `${Object.entries(versions)
			.filter((entry): entry is [string, number] => typeof entry[1] === "number")
			.map(([name, version]) => `${name}.${version}`)
			.sort()
			.join(",")}-2.deepsight.gg`;
	},
	async generate (api) {
		const deepsightComponents = await GetDeepsightManifest.query();
		const deepsightComponentNames = Object.keys(deepsightComponents) as (keyof AllDeepsightManifestComponents)[];

		const cacheKeys = deepsightComponentNames.map(IManifest.CacheComponentKey.get);

		await Model.cacheDB.upgrade((database, transaction) => {
			for (const cacheKey of cacheKeys) {
				if (database.objectStoreNames.contains(cacheKey))
					database.deleteObjectStore(cacheKey);

				const store = database.createObjectStore(cacheKey);

				switch (cacheKey) {
					case "manifest [DeepsightMomentDefinition]":
						if (!store.indexNames.contains("iconWatermark"))
							store.createIndex("iconWatermark", "iconWatermark");
						if (!store.indexNames.contains("id"))
							store.createIndex("id", "id", { unique: true });
						break;
				}
			}
		});

		const totalLoad = deepsightComponentNames.length;

		await Model.cacheDB.transaction(deepsightComponentNames.map(IManifest.CacheComponentKey.get), async transaction => {
			for (let i = 0; i < deepsightComponentNames.length; i++) {
				const componentName = deepsightComponentNames[i];
				const cacheKey = IManifest.CacheComponentKey.get(componentName);

				const startTime = performance.now();
				console.info(`Caching objects from ${cacheKey}`);
				api.emitProgress(i / totalLoad, "Storing manifest");

				await transaction.clear(cacheKey);

				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				for (const [itemId, itemValue] of Object.entries(deepsightComponents[componentName])) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					await transaction.set(cacheKey, itemId, itemValue);
				}

				console.info(`Finished caching objects from ${cacheKey} after ${IManifest.elapsed(performance.now() - startTime)}`);
			}
		});

		return [...deepsightComponentNames] as (keyof AllDeepsightManifestComponents)[];
	},
	process: componentNames => {
		const Manifest = Object.fromEntries(componentNames
			.map(componentName => [componentName, new ManifestItem(componentName, DeepsightManifest)])) as DeepsightManifest;

		for (const componentName of componentNames) {
			Manifest[componentName].setPreCache(true);
		}

		Object.assign(window, { DeepsightManifest: Manifest });
		return Manifest;
	},
	reset: async componentNames => {
		for (const componentName of componentNames ?? []) {
			await Model.cacheDB.clear(IManifest.CacheComponentKey.get(componentName));
			await Model.cacheDB.delete("models", IManifest.CacheComponentKey.getBundle(componentName));
		}
	},
	cacheInvalidated: async componentNames => {
		for (const componentName of componentNames ?? []) {
			await Model.cacheDB.delete("models", IManifest.CacheComponentKey.getBundle(componentName));
		}
	},
});

export { DeepsightManifest };


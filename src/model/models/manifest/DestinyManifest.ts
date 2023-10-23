import type { AllDestinyManifestComponents, DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import { IManifest, ManifestItem } from "model/models/manifest/IManifest";
import Env from "utility/Env";
import GetManifest from "utility/endpoint/bungie/endpoint/destiny2/GetManifest";
import type { AllDeepsightManifestComponents } from "utility/endpoint/deepsight/endpoint/GetDeepsightManifest";
import GetDeepsightManifest from "utility/endpoint/deepsight/endpoint/GetDeepsightManifest";
import type { DeepsightMomentDefinition } from "utility/endpoint/deepsight/endpoint/GetDeepsightMomentDefinition";

const elapsed = IManifest.elapsed;
const CacheComponentKey = IManifest.CacheComponentKey;

declare module "bungie-api-ts/destiny2" {
	interface DestinyRecordDefinition {
		recordTypeName?: string;
	}

	interface AllDestinyManifestComponents {
		DestinyInventoryItemLiteDefinition: {
			[key: number]: DestinyInventoryItemDefinition;
		};
	}
}

type DestinyManifest = {
	[COMPONENT_NAME in keyof AllDestinyManifestComponents]: ManifestItem<COMPONENT_NAME>;
};

const DestinyManifest = Model.create("destiny manifest", {
	cache: "Global",
	version: async () => {
		const manifest = await GetManifest.query();
		return `${manifest.version}-20.deepsight.gg`;
	},
	async generate (api) {
		const manifest = await GetManifest.query();
		const bungieComponentNames = Object.keys(manifest.jsonWorldComponentContentPaths.en) as (keyof AllDestinyManifestComponents)[];

		const { DeepsightMomentDefinition } = await GetDeepsightManifest.query();

		const moments = Object.values(DeepsightMomentDefinition);
		const momentsRequiringWatermarks = Object.fromEntries(moments
			.filter(moment => moment.iconWatermark && typeof moment.iconWatermark !== "string")
			.map(moment => [(moment.iconWatermark as { item: number }).item, moment]));
		const momentsRequiringShelvedWatermarks = Object.fromEntries(moments
			.filter(moment => moment.iconWatermarkShelved && typeof moment.iconWatermarkShelved !== "string")
			.map(moment => [(moment.iconWatermarkShelved as { item: number }).item, moment]));

		const allComponentNames: (keyof AllDestinyManifestComponents | keyof AllDeepsightManifestComponents)[] = [...bungieComponentNames, "DeepsightMomentDefinition"];

		const totalLoad = allComponentNames.length * 2 + 1;

		api.emitProgress(0, "Allocating stores for manifest");
		const cacheKeys = allComponentNames.map(CacheComponentKey.get);

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
						const moment = momentsRequiringWatermarks[key];
						if (moment)
							moment.iconWatermark = itemDef.iconWatermark
								?? itemDef.quality?.displayVersionWatermarkIcons?.[0]
								?? itemDef.iconWatermarkShelved;

						const shelvedMoment = momentsRequiringShelvedWatermarks[key];
						if (shelvedMoment)
							shelvedMoment.iconWatermarkShelved = itemDef.iconWatermarkShelved
								?? itemDef.quality?.displayVersionWatermarkIcons?.[0]
								?? itemDef.iconWatermark;
					}

					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					await transaction.set(cacheKey, key, definition);
				}
			});

			console.info(`Finished caching objects from ${cacheKey} after ${elapsed(performance.now() - startTime)}`);
		}

		const replaceWatermarksByItemHash: Record<number, DeepsightMomentDefinition> =
			Object.fromEntries(moments.flatMap(moment => (moment.itemHashes ?? [])
				.map(itemHash => [itemHash, moment])));

		const deepsightMomentComponentName: keyof AllDeepsightManifestComponents = "DeepsightMomentDefinition";
		const deepsightMomentCacheKey = CacheComponentKey.get(deepsightMomentComponentName);
		await Model.cacheDB.transaction([deepsightMomentCacheKey], async transaction => {
			const startTime = performance.now();
			console.info(`Caching objects from ${deepsightMomentCacheKey}`);
			api.emitProgress((1 + bungieComponentNames.length * 2) / totalLoad, "Storing manifest");

			await transaction.clear(deepsightMomentCacheKey);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			for (const [itemId, itemValue] of Object.entries(DeepsightMomentDefinition)) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				await transaction.set(deepsightMomentCacheKey, itemId, itemValue);
			}

			console.info(`Finished caching objects from ${deepsightMomentCacheKey} after ${elapsed(performance.now() - startTime)}`);
		});

		await Model.cacheDB.transaction(["manifest [DestinyInventoryItemDefinition]"], async transaction => {
			const startTime = performance.now();
			console.info("Updating item watermarks");

			for (const item of await transaction.all("manifest [DestinyInventoryItemDefinition]")) {
				// fix red war items that don't have watermarks for some reason
				const replacementMoment = replaceWatermarksByItemHash[item.hash];
				if (replacementMoment) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					(item as any).iconWatermark = replacementMoment.iconWatermark;
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					(item as any).iconWatermarkShelved = replacementMoment.iconWatermarkShelved;
				} else if (!item.iconWatermark && item.quality?.displayVersionWatermarkIcons.length) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					(item as any).iconWatermark = item.quality.displayVersionWatermarkIcons[0];
				}

				await transaction.set("manifest [DestinyInventoryItemDefinition]", `${item.hash}`, item);
			}

			console.info(`Finished updating item watermarks after ${elapsed(performance.now() - startTime)}`);
		});

		// clear previous bundled caches
		for (const componentName of bungieComponentNames) {
			await Model.cacheDB.delete("models", IManifest.CacheComponentKey.getBundle(componentName));
		}

		return bungieComponentNames;
	},
	process: componentNames => {
		const Manifest = Object.fromEntries(componentNames
			.map(componentName => [componentName, new ManifestItem(componentName)])) as DestinyManifest;

		// const { DestinyPlugSetDefinition } = Manifest;
		// const plugSets = await DestinyPlugSetDefinition.all();
		// const plugItemHashes = Array.from(new Set(plugSets.flatMap(plugSet => plugSet.reusablePlugItems)
		// 	.map(plug => `${plug.plugItemHash}`)));

		for (const componentName of componentNames) {
			switch (componentName) {
				case "DestinyInventoryItemDefinition":
					// Manifest[componentName].setPreCache(plugItemHashes);
					break;
				case "DestinyInventoryItemLiteDefinition":
					// no caching, doesn't get used
					break;
				default:
					Manifest[componentName].setPreCache(true);
			}
		}

		Object.assign(window, { Manifest, DestinyManifest: Manifest });
		return Manifest;
	},
	reset: async componentNames => {
		for (const componentName of componentNames ?? []) {
			await Model.cacheDB.clear(CacheComponentKey.get(componentName));
			await Model.cacheDB.delete("models", IManifest.CacheComponentKey.getBundle(componentName));
		}
	},
});

export default DestinyManifest;

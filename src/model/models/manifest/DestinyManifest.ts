import type { DeepsightMomentDefinition } from "@deepsight.gg/interfaces";
import type { AllDestinyManifestComponents, DestinyInventoryComponent, DestinyInventoryItemDefinition, DestinyItemReusablePlugsComponent, DestinyItemSocketsComponent } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import type Manifest from "model/models/Manifest";
import ProfileBatch from "model/models/ProfileBatch";
import { DeepsightManifest } from "model/models/manifest/DeepsightManifest";
import { IManifest, ManifestItem } from "model/models/manifest/IManifest";
import Env from "utility/Env";
import Objects from "utility/Objects";
import type { Mutable } from "utility/Type";
import Bungie from "utility/endpoint/bungie/Bungie";
import GetManifest from "utility/endpoint/bungie/endpoint/destiny2/GetManifest";

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

const ManifestURLs = Model.create("manifest urls", {
	cache: "Memory",
	generate: () => GetManifest.query(),
});

const DestinyManifest = Model.create("destiny manifest", {
	cache: "Global",
	version: async () => {
		const manifest = await ManifestURLs.await();
		return `${manifest.version}-23.deepsight.gg`;
	},
	async generate (api) {
		const manifest = await ManifestURLs.await();
		const bungieComponentNames = Object.keys(manifest.jsonWorldComponentContentPaths.en) as (keyof AllDestinyManifestComponents)[];

		api.emitProgress(0, "Allocating stores for manifest");
		const cacheKeys = bungieComponentNames.map(CacheComponentKey.get);

		await Model.cacheDB.upgrade((database, transaction) => {
			for (const cacheKey of cacheKeys) {
				if (database.objectStoreNames.contains(cacheKey))
					database.deleteObjectStore(cacheKey);

				const store = database.createObjectStore(cacheKey);

				switch (cacheKey) {
					case "manifest [DestinyInventoryItemDefinition]":
						if (!store.indexNames.contains("iconWatermark"))
							store.createIndex("iconWatermark", "iconWatermark");
						if (!store.indexNames.contains("name"))
							store.createIndex("name", "displayProperties.name");
						if (!store.indexNames.contains("icon"))
							store.createIndex("icon", "displayProperties.icon");
						break;
					case "manifest [DestinyRecordDefinition]":
						if (!store.indexNames.contains("icon"))
							store.createIndex("icon", "displayProperties.icon");
						if (!store.indexNames.contains("name"))
							store.createIndex("name", "displayProperties.name");
						break;
					case "manifest [DestinyCollectibleDefinition]":
						if (!store.indexNames.contains("icon"))
							store.createIndex("icon", "displayProperties.icon");
						if (!store.indexNames.contains("name"))
							store.createIndex("name", "displayProperties.name");
						break;
				}
			}
		});

		return [...bungieComponentNames, "DeepsightMomentDefinition" as const];
	},
	process: async (componentNames) => {
		const Manifest = Object.fromEntries(componentNames
			.map(componentName => [componentName, new DestinyManifestItem(componentName, DestinyManifest)])) as any as Manifest;

		for (const componentName of componentNames)
			await (Manifest[componentName] as DestinyManifestItem<DestinyComponentName>).initialise(Manifest);

		Object.assign(window, { Manifest, DestinyManifest: Manifest });
		return Manifest;
	},
	reset: async componentNames => {
		for (const componentName of componentNames ?? []) {
			await Model.cacheDB.clear(CacheComponentKey.get(componentName));
			await Model.cacheDB.delete("models", CacheComponentKey.getBundle(componentName));
			await Model.cacheDB.delete("models", CacheComponentKey.get(componentName));
		}
	},
	cacheInvalidated: async componentNames => {
		for (const componentName of componentNames ?? []) {
			await Model.cacheDB.delete("models", CacheComponentKey.getBundle(componentName));
		}
	},
});

export default DestinyManifest;

type DestinyComponentName = keyof AllDestinyManifestComponents | "DeepsightMomentDefinition";
class DestinyManifestItem<COMPONENT_NAME extends DestinyComponentName> extends ManifestItem<COMPONENT_NAME> {

	protected override async generate (): Promise<void> {
		const manifest = await ManifestURLs.await();
		const componentName = this.componentName;
		const cacheKey = CacheComponentKey.get(componentName);

		let startTime = performance.now();
		console.info(`Downloading ${cacheKey}`);
		// api.emitProgress((1 + i * 2) / totalLoad, "Downloading manifest");

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
		// api.emitProgress((1 + i * 2 + 1) / totalLoad, "Storing manifest");

		const moments = cacheKey !== "manifest [DestinyInventoryItemDefinition]" ? []
			: await (await DeepsightManifest.await()).DeepsightMomentDefinition.all();

		await Model.cacheDB.transaction([cacheKey], async transaction => {
			await transaction.clear(cacheKey);

			const replaceWatermarksByItemHash: Record<number, DeepsightMomentDefinition> =
				Object.fromEntries(moments.flatMap(moment => (moment.itemHashes ?? [])
					.map(itemHash => [itemHash, moment])) ?? []);

			for (const [key, definition] of Object.entries(data)) {
				if (cacheKey === "manifest [DestinyInventoryItemDefinition]") {
					const itemDef = definition as Mutable<DestinyInventoryItemDefinition>;
					// fix red war items that don't have watermarks for some reason
					const replacementMoment = replaceWatermarksByItemHash[definition.hash];
					if (replacementMoment) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
						itemDef.iconWatermark = replacementMoment.iconWatermark!;
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
						itemDef.iconWatermarkShelved = replacementMoment.iconWatermarkShelved!;
					} else if (!itemDef.iconWatermark && itemDef.quality?.displayVersionWatermarkIcons.length) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
						itemDef.iconWatermark = itemDef.quality.displayVersionWatermarkIcons[0];
					}
				}

				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				await transaction.set(cacheKey, key, definition as any);
			}
		});

		console.info(`Finished caching objects from ${cacheKey} after ${elapsed(performance.now() - startTime)}`);
	}

	public async initialise (Manifest: Manifest) {
		const componentName = this.componentName as DestinyComponentName;
		switch (componentName) {
			case "DestinyInventoryItemDefinition": {
				////////////////////////////////////
				// precache item hashes from profile
				const profile = Bungie.authenticated ? await ProfileBatch.await() : undefined;

				const itemHashes = new Set((profile?.profileInventory?.data?.items.map(item => item.itemHash) ?? [])
					.concat(Object.values<DestinyInventoryComponent>(profile?.characterInventories?.data ?? Objects.EMPTY)
						.concat(Object.values<DestinyInventoryComponent>(profile?.characterEquipment?.data ?? Objects.EMPTY))
						.flatMap(inventory => inventory.items.map(item => item.itemHash))));

				for (const itemSockets of Object.values<DestinyItemSocketsComponent>(profile?.itemComponents?.sockets.data ?? Objects.EMPTY)) {
					for (const socket of itemSockets.sockets ?? [])
						if (socket.plugHash)
							itemHashes.add(socket.plugHash);
				}

				for (const itemPlugsByItems of Object.values<DestinyItemReusablePlugsComponent>(profile?.itemComponents?.reusablePlugs.data ?? Objects.EMPTY)) {
					for (const plugs of Object.values(itemPlugsByItems.plugs))
						for (const plug of plugs)
							itemHashes.add(plug.plugItemHash);
				}

				Manifest[componentName].setPreCache([...itemHashes], async (cache, cacheKeyRange) => {
					////////////////////////////////////
					// precache plug items from cached item defs
					let values = Object.values(cache);
					const itemHashes = new Set<number>();

					for await (const itemDef of values)
						if (itemDef?.inventory?.recipeItemHash)
							if (!cache[`/:${itemDef.inventory.recipeItemHash}`])
								itemHashes.add(itemDef.inventory.recipeItemHash);

					await cacheKeyRange([...itemHashes]);
					itemHashes.clear();

					values = Object.values(cache);
					for await (const itemDef of values) {
						for (const socketEntry of itemDef?.sockets?.socketEntries ?? []) {
							if (!cache[`/:${socketEntry.singleInitialItemHash}`])
								itemHashes.add(socketEntry.singleInitialItemHash);

							for (const plug of socketEntry.reusablePlugItems)
								if (!cache[`/:${plug.plugItemHash}`])
									itemHashes.add(plug.plugItemHash);

							let plugSet = await Manifest.DestinyPlugSetDefinition.get(socketEntry.reusablePlugSetHash);
							for (const plugItem of plugSet?.reusablePlugItems ?? [])
								if (!cache[`/:${plugItem.plugItemHash}`])
									itemHashes.add(plugItem.plugItemHash);

							plugSet = await Manifest.DestinyPlugSetDefinition.get(socketEntry.randomizedPlugSetHash);
							for (const plugItem of plugSet?.reusablePlugItems ?? [])
								if (!cache[`/:${plugItem.plugItemHash}`])
									itemHashes.add(plugItem.plugItemHash);
						}
					}

					return cacheKeyRange([...itemHashes]);
				});

				break;
			}

			case "DestinyInventoryItemLiteDefinition":
				break;

			case "DestinyRecordDefinition":
				Manifest[componentName].setPreCache(true, async cache => {
					const values = Object.values(cache);
					for await (const value of values) {
						if (value?.displayProperties.icon)
							cache[`icon:${value.displayProperties.icon}`] ??= value;

						if (value?.displayProperties.name)
							cache[`name:${value.displayProperties.name}`] ??= value;
					}

					////////////////////////////////////
					// precache by precached invitems

					await Manifest.DestinyInventoryItemDefinition.loadCache();
					await Manifest.DestinyCollectibleDefinition.loadCache();
					const itemDefs = Object.values(Manifest.DestinyInventoryItemDefinition["memoryCache"]);
					for await (const itemDef of itemDefs) {
						if (!itemDef)
							continue;

						const collectible = await Manifest.DestinyCollectibleDefinition.get(itemDef.collectibleHash);
						if (collectible?.displayProperties.icon)
							cache[`icon:${collectible.displayProperties.icon}`] ??= null!;

						if (itemDef.displayProperties.name)
							cache[`name:${itemDef.displayProperties.name}`] ??= null!;
					}
				});
				break;

			default:
				this.setPreCache(true);
		}
	}
}

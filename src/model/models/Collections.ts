import type { DestinyInventoryItemDefinition, DestinyPowerCapDefinition } from "bungie-api-ts/destiny2";
import { DestinyComponentType, ItemCategoryHashes } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Item from "model/models/items/Item";
import Manifest from "model/models/Manifest";
import Profile from "model/models/Profile";
import Display from "ui/bungie/DisplayProperties";
import { Debug } from "utility/Debug";
import type { DestinySourceDefinition } from "utility/endpoint/deepsight/endpoint/GetDestinySourceDefinition";

namespace Collections {

	const sources: Record<number, Model<Item[]>> = {};
	export function source (source: DestinySourceDefinition) {
		return sources[source.hash] ??= Model.createDynamic("Daily", async () => {
			const manifest = await Manifest.await();
			const { DestinyInventoryItemDefinition, DestinyPowerCapDefinition } = manifest;
			const profile = await Profile(DestinyComponentType.Records, DestinyComponentType.Collectibles).await();

			const itemDefs = await DestinyInventoryItemDefinition.all("iconWatermark", typeof source.iconWatermark === "string" ? source.iconWatermark : "?")
				.then(items => items
					.filter(item => item.displayProperties.name && item.equippable
						&& !item.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies)
						&& (item.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) || item.itemCategoryHashes?.includes(ItemCategoryHashes.Armor))));

			const map = new Map<string, Set<DestinyInventoryItemDefinition>>();
			const issues = new Set<DestinyInventoryItemDefinition>();

			for (const itemB of itemDefs) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
				const name = `${Display.name(itemB)!} ${itemB.equippingBlock?.equipmentSlotTypeHash!}`;
				const existing = map.get(name);
				if (existing?.size) {
					const [itemA] = existing;

					const itemAIndex = getPreferredCopySortIndex(itemA, await DestinyPowerCapDefinition.get(itemA.quality?.versions[itemA.quality.currentVersion]?.powerCapHash));
					const itemBIndex = getPreferredCopySortIndex(itemB, await DestinyPowerCapDefinition.get(itemB.quality?.versions[itemB.quality.currentVersion]?.powerCapHash));

					if (itemBIndex < itemAIndex)
						// don't replace itemA copy if itemB copy is worse
						continue;

					if (itemAIndex === itemBIndex) {
						if (itemA.displayProperties.icon !== itemB.displayProperties.icon) {
							// allow identical items with different icons
							existing.add(itemB);
							continue;
						}

						if (Debug.collectionsDuplicates)
							console.warn("Could not find difference between:", name, itemA, itemB);

						issues.add(itemA);
						issues.add(itemB);
						continue;
					}
				}

				map.set(name, new Set([itemB]));
			}

			// eslint-disable-next-line no-constant-condition
			return Promise.all([...Debug.collectionsDuplicates && issues.size > 0 ? issues.values() : [...map.values()].flatMap(items => [...items.values()])]
				.map(item => Item.createFake(manifest, profile, item)));
		})
	}
}

export default Collections;

function getPreferredCopySortIndex (item: DestinyInventoryItemDefinition, powerCap?: DestinyPowerCapDefinition) {
	return (item.collectibleHash ? 100000 : 0)
		+ (item.plug ? 0 : 10000)
		+ ((powerCap?.powerCap ?? 0) < 900000 ? 0 : 1000);
}

import { ItemCategoryHashes } from "@deepsight.gg/enums";
import type { Bucket } from "model/models/Items";
import type Item from "model/models/items/Item";
import type { BucketId } from "model/models/items/Item";
import { TierHashes } from "model/models/items/Tier";

export default class DebugInfo {
	public static updateBuckets (buckets: Record<BucketId, Bucket>) {
		interface ItemRarities {
			basics: Item[];
			commons: Item[];
			uncommons: Item[];
			rares: Item[];
			legendaries: Item[];
			exotics: Item[];
		}

		function getRarities (items: Item[]): ItemRarities {
			return {
				basics: items.filter(item => item.definition.inventory?.tierTypeHash === TierHashes.Basic),
				commons: items.filter(item => item.definition.inventory?.tierTypeHash === TierHashes.Common),
				uncommons: items.filter(item => item.definition.inventory?.tierTypeHash === TierHashes.Uncommon),
				rares: items.filter(item => item.definition.inventory?.tierTypeHash === TierHashes.Rare),
				legendaries: items.filter(item => item.definition.inventory?.tierTypeHash === TierHashes.Legendary),
				exotics: items.filter(item => item.definition.inventory?.tierTypeHash === TierHashes.Exotic),
			};
		}

		function applyRarities (items: Item[]) {
			const result = items as Item[] & ItemRarities;
			Object.assign(result, getRarities(items));
			return result;
		}

		function filterByCategory (items: Item[], category: ItemCategoryHashes) {
			return applyRarities(items.filter(item => item.definition.itemCategoryHashes?.includes(category)));
		}

		function getDeveloperData (items: Item[]) {
			return {
				weapons: filterByCategory(items, ItemCategoryHashes.Weapon),
				armour: filterByCategory(items, ItemCategoryHashes.Armor),
				emotes: filterByCategory(items, ItemCategoryHashes.Emotes),
				ships: filterByCategory(items, ItemCategoryHashes.Ships),
				sparrows: filterByCategory(items, ItemCategoryHashes.Sparrows),
				ghosts: filterByCategory(items, ItemCategoryHashes.Ghost),
				consumables: filterByCategory(items, ItemCategoryHashes.Consumables),
			};
		}

		const items = Object.values(buckets).flatMap(bucket => bucket.items);
		const collections = items.map(item => item.collections).filter((item): item is Item => !!item);
		const inventory: any = {
			buckets,
			all: applyRarities(items),
			...getDeveloperData(items),
			collections: {
				all: applyRarities(collections),
				...getDeveloperData(collections),
			},
		};

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		Object.assign(window, {
			...inventory,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			items: inventory,
		});
	}
}

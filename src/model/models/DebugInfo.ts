import { InventoryBucketHashes, ItemCategoryHashes, ItemTierTypeHashes } from "@deepsight.gg/enums";
import type { Buckets } from "model/models/Items";
import type Item from "model/models/items/Item";
import type { Bucket } from "model/models/items/Item";

export default class DebugInfo {
	public static updateBuckets (buckets: Buckets) {
		const encountered = new Map<Item, Set<Bucket>>();
		for (const bucket of Object.values(buckets)) {
			for (const item of bucket?.items ?? []) {
				let buckets = encountered.get(item);
				if (!buckets) {
					buckets = new Set();
					encountered.set(item, buckets);
				}

				buckets.add(bucket!);
			}
		}

		const encounteredMultiple = Array.from(encountered.entries())
			.filter(([, buckets]) => buckets.size > 1);
		if (encounteredMultiple.length)
			console.warn("Items are in multiple buckets!", encounteredMultiple);

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
				// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
				basics: items.filter(item => [ItemTierTypeHashes.BasicCurrency, ItemTierTypeHashes.BasicQuest].includes(item.definition.inventory?.tierTypeHash!)),
				commons: items.filter(item => item.definition.inventory?.tierTypeHash === ItemTierTypeHashes.Common),
				uncommons: items.filter(item => item.definition.inventory?.tierTypeHash === ItemTierTypeHashes.Uncommon),
				rares: items.filter(item => item.definition.inventory?.tierTypeHash === ItemTierTypeHashes.Rare),
				legendaries: items.filter(item => item.definition.inventory?.tierTypeHash === ItemTierTypeHashes.Legendary),
				exotics: items.filter(item => item.definition.inventory?.tierTypeHash === ItemTierTypeHashes.Exotic),
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

		function filterByBucket (items: Item[], ...buckets: InventoryBucketHashes[]) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
			return applyRarities(items.filter(item => buckets.includes(item.definition.inventory?.bucketTypeHash!)));
		}

		function getDeveloperData (items: Item[]) {
			return {
				weapons: filterByCategory(items, ItemCategoryHashes.Weapon),
				armour: filterByCategory(items, ItemCategoryHashes.Armor),
				emotes: filterByBucket(items, InventoryBucketHashes.Emotes_Category0, InventoryBucketHashes.Emotes_Category3),
				finishers: filterByBucket(items, InventoryBucketHashes.Finishers),
				quests: filterByBucket(items, InventoryBucketHashes.Quests),
				ships: filterByCategory(items, ItemCategoryHashes.Ships),
				sparrows: filterByCategory(items, ItemCategoryHashes.Sparrows),
				ghosts: filterByCategory(items, ItemCategoryHashes.Ghost),
				consumables: filterByBucket(items, InventoryBucketHashes.Consumables),
				artifacts: filterByCategory(items, ItemCategoryHashes.SeasonalArtifacts),
				subclasses: filterByCategory(items, ItemCategoryHashes.Subclasses),
			};
		}

		const items = Object.values(buckets).flatMap(bucket => bucket?.items ?? []);
		const collections = items.map(item => item.collections).filter((item): item is Item => !!item);
		const filtered = getDeveloperData(items);
		const inventory: any = {
			buckets,
			all: applyRarities(items),
			uncategorised: items.filter(item => !Object.values(filtered).some(arr => arr.includes(item))),
			...filtered,
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

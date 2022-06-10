import type { DestinyInventoryItemDefinition, DestinyItemComponent } from "bungie-api-ts/destiny2";
import { DestinyComponentType } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import DestinyEnums from "model/models/DestinyEnums";
import Manifest from "model/models/Manifest";
import Profile from "model/models/Profile";
import Time from "utility/Time";

export type BucketId = `${bigint}` | "vault" | "inventory";
export interface IItem {
	location: BucketId;
	instance: DestinyItemComponent;
	definition: DestinyInventoryItemDefinition;
}

export interface Item extends IItem { }
export class Item {

	public constructor (item: IItem) {
		Object.assign(this, item);
	}
}

export class Bucket {

	public get items (): readonly Item[] {
		return this._items;
	}

	public constructor (public readonly id: BucketId, private _items: Item[]) {
	}
}

export default Model.createDynamic(Time.seconds(30), async () => {
	const { DestinyInventoryItemDefinition } = await Manifest.await();
	const { BucketHashes } = await DestinyEnums.await();

	const initialisedItems = new Set<string>();

	async function createBucket (id: BucketId, itemComponents: DestinyItemComponent[]) {
		const items: Item[] = [];
		for (const item of itemComponents) {
			const itemDef = await DestinyInventoryItemDefinition.get(item.itemHash);
			if (!itemDef) {
				console.warn("No item definition for ", item.itemHash);
				continue;
			}

			const itemId = item.itemInstanceId ?? `item:${item.itemHash}`;
			if (initialisedItems.has(itemId)) {
				console.debug(`Skipping "${itemDef.displayProperties.name}", already initialised in another bucket`);
				continue; // already initialised in another bucket
			}

			if (itemDef.nonTransferrable) {
				console.debug(`Skipping "${itemDef.displayProperties.name}", non-transferrable`);
				continue;
			}

			initialisedItems.add(itemId);

			items.push(new Item({
				location: id,
				instance: item,
				definition: itemDef,
			}));
		}

		return new Bucket(id, items);
	}

	const profile = await Profile(DestinyComponentType.CharacterInventories, DestinyComponentType.ProfileInventories).await();
	const buckets = {} as Record<BucketId, Bucket>;
	for (const [characterId, character] of Object.entries(profile.characterInventories.data ?? {})) {
		const bucketId = characterId as BucketId;
		buckets[bucketId] = await createBucket(bucketId, character.items);
	}

	const profileItems = profile.profileInventory.data?.items ?? [];
	buckets.inventory = await createBucket("inventory", profileItems
		.filter(item => item.bucketHash === BucketHashes.byName("Modifications") || item.bucketHash === BucketHashes.byName("Consumables")));
	buckets.vault = await createBucket("vault", profileItems);

	return buckets;
});

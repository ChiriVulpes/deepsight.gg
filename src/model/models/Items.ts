import type { DestinyInventoryItemDefinition, DestinyItemComponent, DestinyObjectiveProgress } from "bungie-api-ts/destiny2";
import { DestinyComponentType, ItemLocation } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import DestinyEnums from "model/models/DestinyEnums";
import Manifest from "model/models/Manifest";
import Profile from "model/models/Profile";
import Time from "utility/Time";

export type BucketId = `${bigint}` | "vault" | "inventory" | "postmaster";
export interface IItem {
	location: BucketId;
	equipped?: true;
	instance: DestinyItemComponent;
	definition: DestinyInventoryItemDefinition;
	objectives?: Record<string, DestinyObjectiveProgress[]>;
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

export default Model.createDynamic(Time.seconds(30), async api => {
	api.subscribeProgress(Manifest, 1 / 3);
	const { DestinyInventoryItemDefinition } = await Manifest.await();
	const { BucketHashes } = await DestinyEnums.await();

	const ProfileQuery = Profile(
		DestinyComponentType.CharacterInventories,
		DestinyComponentType.CharacterEquipment,
		DestinyComponentType.ProfileInventories,
	);

	api.subscribeProgress(ProfileQuery, 1 / 3, 1 / 3);
	const profile = await ProfileQuery.await();

	const initialisedItems = new Set<string>();

	async function resolveItemComponent (itemComponent: DestinyItemComponent) {
		api.emitProgress(2 / 3 + 1 / 3 * (initialisedItems.size / (profile.profileInventory.data?.items.length ?? 1)), "Loading items");
		const itemDef = await DestinyInventoryItemDefinition.get(itemComponent.itemHash);
		if (!itemDef) {
			console.warn("No item definition for ", itemComponent.itemHash);
			return undefined;
		}

		const itemId = itemComponent.itemInstanceId ?? `item:${itemComponent.itemHash}`;
		if (initialisedItems.has(itemId)) {
			console.debug(`Skipping "${itemDef.displayProperties.name}", already initialised in another bucket`);
			return undefined; // already initialised in another bucket
		}

		if (itemDef.nonTransferrable) {
			console.debug(`Skipping "${itemDef.displayProperties.name}", non-transferrable`);
			return undefined;
		}

		initialisedItems.add(itemId);

		return { definition: itemDef, instance: itemComponent };
	}

	async function createBucket (id: BucketId, itemComponents: DestinyItemComponent[]) {
		const items: Item[] = [];
		for (const itemComponent of itemComponents) {
			const item = await resolveItemComponent(itemComponent);
			if (!item)
				continue;

			items.push(new Item({
				location: id,
				...item,
			}));
		}

		return new Bucket(id, items);
	}

	const profileItems = profile.profileInventory.data?.items ?? [];

	const buckets = {} as Record<BucketId, Bucket>;
	buckets.postmaster = await createBucket("postmaster", profileItems
		.filter(item => item.location === ItemLocation.Postmaster));

	for (const [characterId, character] of Object.entries(profile.characterInventories.data ?? {})) {
		const bucketId = characterId as BucketId;
		const bucket = buckets[bucketId] = await createBucket(bucketId, character.items);

		for (const itemComponent of (profile.characterEquipment.data?.[bucketId].items ?? [])) {
			const item = await resolveItemComponent(itemComponent);
			if (!item)
				continue;

			bucket["_items"].push(new Item({
				location: bucketId,
				equipped: true,
				...item,
			}));
		}
	}

	buckets.inventory = await createBucket("inventory", profileItems
		.filter(item => item.bucketHash === BucketHashes.byName("Modifications") || item.bucketHash === BucketHashes.byName("Consumables")));
	buckets.vault = await createBucket("vault", profileItems);

	return buckets;
});

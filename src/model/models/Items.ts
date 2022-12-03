import type { DestinyInventoryComponent, DestinyItemComponent } from "bungie-api-ts/destiny2";
import { BucketHashes, DestinyComponentType } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import type { BucketId, CharacterId } from "model/models/items/Item";
import Item from "model/models/items/Item";
import Manifest from "model/models/Manifest";
import Profile from "model/models/Profile";
import Time from "utility/Time";

/**
 * **Warning:** Not all weapon mods have this category hash
 */
export const ITEM_WEAPON_MOD = 610365472;

export class Bucket {

	public constructor (public readonly id: BucketId, public readonly items: Item[]) {
	}
}

export default Model.createDynamic(Time.seconds(30), async api => {
	api.subscribeProgress(Manifest, 1 / 3);
	const manifest = await Manifest.await();

	const ProfileQuery = Profile(
		DestinyComponentType.CharacterInventories,
		DestinyComponentType.CharacterEquipment,
		DestinyComponentType.ProfileInventories,
		DestinyComponentType.ItemInstances,
		DestinyComponentType.ProfileProgression,
		DestinyComponentType.ItemPlugObjectives,
		DestinyComponentType.ItemStats,
		DestinyComponentType.Records,
		DestinyComponentType.ItemSockets,
		DestinyComponentType.ItemReusablePlugs,
		DestinyComponentType.ItemPlugStates,
	);

	api.subscribeProgress(ProfileQuery, 1 / 3, 1 / 3);
	const profile = await ProfileQuery.await();

	const initialisedItems = new Set<string>();

	async function resolveItemComponent (reference: DestinyItemComponent, bucket: BucketId) {
		api.emitProgress(2 / 3 + 1 / 3 * (initialisedItems.size / (profile.profileInventory?.data?.items.length ?? 1)), "Loading items");
		const itemId = Item.id(reference);
		if (initialisedItems.has(itemId))
			return undefined; // already initialised in another bucket

		initialisedItems.add(itemId);
		const result = await Item.resolve(manifest, profile, reference, bucket);
		if (!result)
			initialisedItems.delete(itemId);

		return result;
	}

	async function createBucket (id: BucketId, itemComponents: DestinyItemComponent[]) {
		const items: Item[] = [];
		for (const itemComponent of itemComponents) {
			const item = await resolveItemComponent(itemComponent, id);
			if (!item)
				continue;

			items.push(item);
		}

		return new Bucket(id, items);
	}

	const profileItems = profile.profileInventory?.data?.items ?? [];

	const buckets = {} as Record<BucketId, Bucket>;
	for (const [characterId, character] of Object.entries(profile.characterInventories?.data ?? {}) as [CharacterId, DestinyInventoryComponent][]) {
		const postmasterId = `postmaster:${characterId}` as const;
		buckets[postmasterId] = await createBucket(postmasterId, character.items
			.filter(item => item.bucketHash === BucketHashes.LostItems || item.bucketHash === BucketHashes.Engrams));

		const bucket = buckets[characterId] = await createBucket(characterId, character.items);

		for (const itemComponent of (profile.characterEquipment?.data?.[characterId].items ?? [])) {
			const item = await resolveItemComponent(itemComponent, characterId);
			if (!item)
				continue;

			item.equipped = true;
			bucket.items.push(item);
		}
	}

	buckets.inventory = await createBucket("inventory", profileItems
		.filter(item => item.bucketHash === BucketHashes.Modifications || item.bucketHash === BucketHashes.Consumables));
	buckets.vault = await createBucket("vault", profileItems);

	return buckets;
});

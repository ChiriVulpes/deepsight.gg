import { InventoryBucketHashes } from "@deepsight.gg/enums";
import { DestinyClass, type DestinyInventoryBucketDefinition, type DestinyItemComponent } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Characters from "model/models/Characters";
import type { BucketId } from "model/models/items/Bucket";
import { Bucket } from "model/models/items/Bucket";
import type { CharacterId } from "model/models/items/Item";
import Item from "model/models/items/Item";
import Plugs from "model/models/items/Plugs";
import Manifest from "model/models/Manifest";
import { ManifestItem } from "model/models/manifest/IManifest";
import ProfileBatch from "model/models/ProfileBatch";
import Async from "utility/Async";
import Time from "utility/Time";

export type Buckets<BUCKET = Bucket> = Partial<Record<BucketId, BUCKET>>;

export default Model.createDynamic(Time.seconds(30), async api => {
	api.subscribeProgress(Manifest, 2 / 10);
	const manifest = await Manifest.await();

	api.emitProgress(2 / 10, "Loading manifest cache");
	// precache some defs for item initialisation
	const { DeepsightDropTableDefinition, DestinyActivityDefinition, DeepsightCollectionsDefinition, DestinyInventoryItemDefinition, DeepsightMomentDefinition } = manifest;
	await DeepsightDropTableDefinition.all();
	await DestinyActivityDefinition.all();

	const profile = await api.subscribeProgressAndWait(ProfileBatch, 1 / 10, 3 / 10);

	api.emitProgress(4 / 10, "Loading items");

	const initialisedItems = new Set<string>();
	const itemsToInit = new Set<string>((profile.profileInventory?.data?.items ?? [])
		.concat(Object.values(profile.characterInventories?.data ?? {}).flatMap(character => character.items))
		.map(item => item.itemInstanceId ?? ""));
	itemsToInit.delete("");
	let totalItemsToInit = itemsToInit.size;
	const occurrences: Record<string, number> = {};

	let lastForcedTimeoutForStyle = Date.now();

	async function resolveItemComponent (reference: DestinyItemComponent, bucket: Bucket) {
		if (Date.now() - lastForcedTimeoutForStyle > 40) {
			await Async.sleep(0);
			lastForcedTimeoutForStyle = Date.now();
		}

		if (itemsToInit.size !== totalItemsToInit)
			api.emitProgress((4 / 10) + (3 / 10) * (1 - itemsToInit.size / totalItemsToInit), `Loading items ${totalItemsToInit - itemsToInit.size} / ${totalItemsToInit}`);

		if (reference.itemInstanceId !== undefined && initialisedItems.has(reference.itemInstanceId))
			return undefined; // already initialised in another bucket

		occurrences[`${reference.itemHash}:${reference.bucketHash}`] ??= 0;
		const occurrence = occurrences[`${reference.itemHash}:${reference.bucketHash}`]++;

		if (reference.itemInstanceId !== undefined) {
			initialisedItems.add(reference.itemInstanceId);
			itemsToInit.delete(reference.itemInstanceId);
		}

		const result = await Item.resolve(manifest, profile, reference, bucket, occurrence);
		if (!result && reference.itemInstanceId !== undefined)
			initialisedItems.delete(reference.itemInstanceId);

		return result;
	}

	interface BucketInit {
		bucketHash: InventoryBucketHashes;
		characterId?: CharacterId;
		items: DestinyItemComponent[];
	}

	const bucketInits: Partial<Record<BucketId, BucketInit>> = {};
	function bucketItem (item: DestinyItemComponent, characterId?: CharacterId) {
		const bucketHash = item.bucketHash as InventoryBucketHashes;
		if (bucketHash === undefined) {
			console.warn("No bucket hash", item);
			return;
		}

		const bucketId = Bucket.id(bucketHash, characterId);
		const bucket: BucketInit = bucketInits[bucketId] ??= {
			bucketHash,
			characterId: characterId,
			items: [],
		};

		bucket.items.push(item);
	}

	for (const item of profile.profileInventory?.data?.items ?? [])
		bucketItem(item);

	const characterItems = Object.entries(profile.characterInventories?.data ?? {}).concat(Object.entries(profile.characterEquipment?.data ?? {}));
	for (const [characterId, characterData] of characterItems)
		for (const item of characterData.items)
			bucketItem(item, characterId as CharacterId);

	const buckets: Partial<Record<BucketId, Bucket>> = {};
	for (const [id, bucketInit] of Object.entries(bucketInits) as [BucketId, BucketInit][]) {
		let bucketDef = await manifest.DestinyInventoryBucketDefinition.get(bucketInit.bucketHash);
		if (!bucketDef) {
			console.warn("No definition for bucket", bucketInit.bucketHash);
			bucketDef = {
				displayProperties: {
					name: "Unknown Bucket",
				},
			} as DestinyInventoryBucketDefinition;
		}

		const bucket = new Bucket({
			definition: bucketDef,
			character: Characters.all()[bucketInit.characterId!],
		});
		const equippedItems = profile.characterEquipment?.data?.[bucket.characterId!]?.items ?? [];

		for (const itemComponent of bucketInit.items) {
			const item = await resolveItemComponent(itemComponent, bucket);
			if (!item)
				continue;

			bucket.addItems(item);
			if (equippedItems.some(equippedItem => equippedItem.itemInstanceId === item.reference.itemInstanceId))
				item.equipped = true;
		}

		buckets[id] = bucket;
	}

	for (const bucket of Object.values(buckets)) {
		if (!bucket || bucket.characterId)
			continue;

		// create character-scoped versions of this account bucket
		for (const characterId of Object.keys(profile.characterInventories?.data ?? {}) as CharacterId[]) {
			const classType = profile.characters?.data?.[characterId].classType;
			let characterBucket: Bucket | undefined;
			for (const item of bucket.items) {
				if (item.definition.classType === classType) {
					const character = Characters.get(characterId);
					if (!character) {
						console.warn("Unable to get character", characterId);
						continue;
					}

					characterBucket ??= new Bucket({
						definition: bucket.definition,
						character,
						items: () =>
							bucket.items.filter(item => true
								&& (item.definition.classType === DestinyClass.Unknown || item.definition.classType === character.classType)
								&& item.definition.inventory?.bucketTypeHash
								&& item.definition.inventory.bucketTypeHash !== bucket.definition.hash),
					});
					buckets[characterBucket.id] ??= characterBucket;
					break;
				}
			}
		}
	}

	for (const bucket of Object.values(buckets)) {
		if (!bucket)
			continue;

		// create sub buckets for items with differing `inventory.bucketTypeHash`es 
		const subBuckets = {} as Partial<Record<number, Bucket>>;
		for (const item of bucket.items) {
			const subInventoryHash = item.definition.inventory?.bucketTypeHash;
			if (subInventoryHash && subInventoryHash !== bucket.definition.hash) {
				const subBucket = subBuckets[subInventoryHash] ??= new Bucket({
					definition: bucket.definition,
					subBucketDefinition: await manifest.DestinyInventoryBucketDefinition.get(subInventoryHash),
					character: Characters.get(bucket.characterId),
					items: () =>
						bucket.items.filter(item => true
							&& item.definition.inventory?.bucketTypeHash
							&& item.definition.inventory.bucketTypeHash !== bucket.definition.hash
							&& item.definition.inventory.bucketTypeHash === subInventoryHash),
				});

				buckets[subBucket.id] ??= subBucket;
			}
		}
	}

	////////////////////////////////////
	// Fix some modifications items being miscategorised
	const dummyVaultBucketId = Bucket.id(InventoryBucketHashes.General, undefined, InventoryBucketHashes.Dummy_ItemCount5);
	const miscategorised = buckets[dummyVaultBucketId]?.items ?? [];
	delete buckets[dummyVaultBucketId];

	if (miscategorised.length) {
		const modificationsBucketId = Bucket.id(InventoryBucketHashes.General, undefined, InventoryBucketHashes.Modifications);
		const bucket = buckets[Bucket.id(InventoryBucketHashes.General)]!;
		buckets[modificationsBucketId] ??= new Bucket({
			definition: bucket.definition,
			subBucketDefinition: await manifest.DestinyInventoryBucketDefinition.get(InventoryBucketHashes.Modifications),
			character: Characters.get(bucket.characterId),
			items: () => bucket.items.filter(item => true
				&& item.definition.inventory?.bucketTypeHash
				&& item.definition.inventory.bucketTypeHash !== bucket.definition.hash
				&& (false
					|| item.definition.inventory.bucketTypeHash === InventoryBucketHashes.Modifications
					|| item.definition.inventory.bucketTypeHash === InventoryBucketHashes.Dummy_ItemCount5
					|| false)),
		});
	}

	////////////////////////////////////
	// Add collections bucket
	buckets["collections//"] = Bucket.COLLECTIONS;
	api.emitProgress(7 / 10, "Loading collections");

	const collections = await DeepsightCollectionsDefinition.all();
	const moments = await DeepsightMomentDefinition.all();

	const collectionsBucketHashes = new Set<InventoryBucketHashes>();
	totalItemsToInit = collections.flatMap(collection => Object.values(collection.buckets)).flat().length;
	let initItems = 0;

	for (const moment of collections) {
		for (const [bucketId, itemHashes] of Object.entries(moment.buckets)) {
			const subBucketHash = +bucketId as InventoryBucketHashes;
			collectionsBucketHashes.add(subBucketHash);

			const momentName = moments.find(m => m.hash === moment.hash)?.displayProperties.name;
			for (const hash of itemHashes) {
				if (Date.now() - lastForcedTimeoutForStyle > 40) {
					await Async.sleep(0);
					lastForcedTimeoutForStyle = Date.now();
				}

				api.emitProgress((7 / 10) + (3 / 10) * (initItems / totalItemsToInit), [
					`Loading collections ${++initItems} / ${totalItemsToInit}`,
					...momentName ? [momentName] : [],
				]);

				const definition = await DestinyInventoryItemDefinition.get(hash);
				if (!definition)
					continue;

				Bucket.COLLECTIONS.addItems(await Item.createFake(manifest, profile, definition));
			}
		}
	}

	for (const subBucketHash of collectionsBucketHashes) {
		buckets[`collections//${subBucketHash}`] ??= new Bucket({
			definition: Bucket.COLLECTIONS.definition,
			subBucketDefinition: await manifest.DestinyInventoryBucketDefinition.get(subBucketHash),
			items: () => Bucket.COLLECTIONS.getItemsInSubBucket(subBucketHash),
		});
	}

	Plugs.resetInitialisedPlugTypes();

	Plugs.logInitialisedPlugTypes();
	ManifestItem.logQueryCounts();
	api.emitProgress(1);

	return buckets;
});

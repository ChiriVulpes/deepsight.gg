import { DestinyClass, type DestinyItemComponent } from "bungie-api-ts/destiny2";
import type { InventoryBucketHashes, InventoryItemHashes } from "deepsight.gg/Enums";
import type { IModelGenerationApi } from "model/Model";
import Model from "model/Model";
import Characters from "model/models/Characters";
import Manifest from "model/models/Manifest";
import ProfileBatch from "model/models/ProfileBatch";
import type { BucketId } from "model/models/items/Bucket";
import { Bucket } from "model/models/items/Bucket";
import type { CharacterId, ItemId } from "model/models/items/Item";
import Item from "model/models/items/Item";
import IStateModification from "model/models/state/IStateModification";
import FocusManager from "ui/utility/FocusManager";
import Async from "utility/Async";
import type { EventParameter } from "utility/EventManager";
import { EventManager } from "utility/EventManager";
import Time from "utility/Time";
import type { Mutable } from "utility/Type";
import Bound from "utility/decorator/Bound";

interface IInventoryModelEvents {
	update: Event;
	itemUpdate: Event;
}

export default class Inventory {

	public static readonly INSTANCE: Inventory; // do not instantiate here, this happens before decorators

	public static createModel () {
		return Model.createTemporary(async api => {
			const profilePromise = Inventory.INSTANCE.queueProfileRefresh(api, 1 / 2);
			if (!ProfileBatch.latest)
				await profilePromise;
			if (!Inventory.INSTANCE.hadInitialLoad)
				await Inventory.INSTANCE.await(api, 1 / 2, 1 / 2);
			return Inventory.INSTANCE;
		});
	}

	public static await (api?: IModelGenerationApi, amount?: number, from?: number) {
		return Inventory.createModel().await(api, amount, from);
	}

	public readonly event = new EventManager<this, IInventoryModelEvents>(this);

	private readonly items: Record<string, Item | undefined> = {};
	private readonly buckets: Record<string, Bucket | undefined> = {};
	private readonly craftedItems = new Set<InventoryItemHashes>();

	public constructor () {
		ProfileBatch.event.subscribe("loaded", this.onProfileUpdate);
		IStateModification.event.subscribe("apply", this.onProfileUpdate);

		Characters.event.subscribe("loaded", this.onCharactersLoaded);

		if (FocusManager.focused)
			this.onPageFocusChange(FocusManager);

		FocusManager.event.subscribe("changeFocusState", this.onPageFocusChange);
	}

	public getItem (item?: ItemId) {
		return this.items[item!];
	}

	public getItems (filter?: (item: Item) => any) {
		const items = Object.values<Item | undefined>(this.items)
			.filter((item): item is Item => !!item && !item.bucket.isCollections());
		return filter ? items.filter(filter) : items;
	}

	public isCrafted (item?: number) {
		return this.craftedItems.has(item!);
	}

	public hasBucket (bucket?: BucketId): boolean;
	public hasBucket (bucket?: InventoryBucketHashes, character?: CharacterId, subBucket?: InventoryBucketHashes): boolean;
	public hasBucket (bucket?: BucketId | InventoryBucketHashes, character?: CharacterId, subBucket?: InventoryBucketHashes) {
		if (typeof bucket === "number")
			bucket = Bucket.id(bucket, character, subBucket);
		return !!this.buckets[bucket!];
	}

	public getBucket (bucket?: BucketId): Bucket | undefined;
	public getBucket (bucket?: InventoryBucketHashes, character?: CharacterId, subBucket?: InventoryBucketHashes): Bucket | undefined;
	public getBucket (bucket?: BucketId | InventoryBucketHashes, character?: CharacterId, subBucket?: InventoryBucketHashes) {
		if (typeof bucket === "number")
			bucket = Bucket.id(bucket, character, subBucket);
		return this.buckets[bucket!];
	}

	public getBuckets () {
		return Object.values<Bucket | undefined>(this.buckets)
			.filter((bucket): bucket is Bucket => !!bucket);
	}

	public getBucketsOfType (bucketHash?: InventoryBucketHashes) {
		return Object.values<Bucket | undefined>(this.buckets)
			.filter((bucket): bucket is Bucket => bucket?.hash === bucketHash);
	}

	public getCharacterBuckets (characterId?: CharacterId) {
		return Object.values<Bucket | undefined>(this.buckets)
			.filter((bucket): bucket is Bucket => bucket?.characterId === characterId);
	}

	private async queueProfileRefresh (api?: IModelGenerationApi, amount = 1, from = 0) {
		await ProfileBatch.await(api, amount, from);
	}

	private hadInitialLoad = false;
	private refreshPromise?: Promise<void>;
	private refreshWatchers: { api: IModelGenerationApi, amount: number, from: number }[] = [];
	private async await (api?: IModelGenerationApi, amount = 1, from = 0) {
		if (!this.refreshPromise || this.hadInitialLoad)
			return;

		if (api)
			this.refreshWatchers.push({ api, amount, from });

		await this.refreshPromise;
	}

	public get refreshing () {
		return this.refreshPromise;
	}

	@Bound private async refresh (api?: IModelGenerationApi, amount = 1, from = 0) {
		if (api)
			this.refreshWatchers.push({ api, amount, from });

		const manifest = await Manifest.await(api, amount * (1 / 4), from + amount * (0 / 4));
		const { DeepsightCollectionsDefinition, DeepsightMomentDefinition, DestinyInventoryItemDefinition, DeepsightSocketExtendedDefinition, DeepsightDropTableDefinition, DestinyActivityDefinition, DestinyInventoryBucketDefinition } = manifest;

		for (const { api, from, amount } of this.refreshWatchers)
			api.emitProgress(from + amount * (1 / 4) + amount * (1 / 4) * (0 / 5), "Loading drop tables");
		await DeepsightDropTableDefinition.all();

		for (const { api, from, amount } of this.refreshWatchers)
			api.emitProgress(from + amount * (1 / 4) + amount * (1 / 4) * (1 / 5), "Loading extended socket data");
		await DeepsightSocketExtendedDefinition.all();

		for (const { api, from, amount } of this.refreshWatchers)
			api.emitProgress(from + amount * (1 / 4) + amount * (1 / 4) * (2 / 5), "Loading activities");
		await DestinyActivityDefinition.all();

		for (const { api, from, amount } of this.refreshWatchers)
			api.emitProgress(from + amount * (1 / 4) + amount * (1 / 4) * (3 / 5), "Loading moments");
		const moments = await DeepsightMomentDefinition.all();

		for (const { api, from, amount } of this.refreshWatchers)
			api.emitProgress(from + amount * (1 / 4) + amount * (1 / 4) * (4 / 5), "Loading collections");
		const collections = await DeepsightCollectionsDefinition.all();


		let lastForcedTimeoutForStyle = Date.now();

		const profile = ProfileBatch.latest!;

		let refreshedItems = 0;
		const totalItems = 0
			+ (profile.profileInventory?.data?.items.length ?? 0)
			+ (Object.values(profile.characterInventories?.data ?? {}).flatMap(character => character.items).length);

		const classTypes = Characters.getSortedClasses()
			.concat(DestinyClass.Titan, DestinyClass.Hunter, DestinyClass.Warlock)
			.distinct();

		this.craftedItems.clear();

		const encountered = new Set<string>();
		const refreshItem = async (itemRef: DestinyItemComponent, characterId?: CharacterId, equipped?: true) => {
			refreshedItems++;
			for (const { api, from, amount } of this.refreshWatchers) {
				const fromItems = from + amount * (2 / 4);
				const amountItems = amount * (1 / 4);
				api.emitProgress(fromItems + amountItems * (refreshedItems / totalItems), `Loading items ${refreshedItems} / ${totalItems}`);
			}

			if (Date.now() - lastForcedTimeoutForStyle > 40) {
				await Async.sleep(0);
				lastForcedTimeoutForStyle = Date.now();
			}

			const genericBucketId = Bucket.id(itemRef.bucketHash) as BucketId;
			const genericBucket = this.buckets[genericBucketId] ??= Bucket.create({
				definition: await DestinyInventoryBucketDefinition.get(itemRef.bucketHash),
			});

			if (!genericBucket) {
				unknownBuckets.push(itemRef);
				return;
			}

			occurrences[itemRef.itemHash] ??= 0;
			const occurrence = occurrences[itemRef.itemHash]++;
			const itemId = Item.id(itemRef, occurrence);
			encountered.add(itemId);

			let item = this.items[itemId];
			if (!item) {
				const definition = await DestinyInventoryItemDefinition.get(itemRef.itemHash);
				if (!definition)
					return;

				item = await Item.resolve(manifest, profile, itemRef, genericBucket, occurrence, definition);
				if (!item)
					return;
			}

			this.items[itemId] = item;
			item.equipped = equipped;

			const bucketIds: BucketId[] = [genericBucketId];

			const characterBucketId = characterId ? Bucket.id(itemRef.bucketHash, characterId) as BucketId : undefined;
			if (characterBucketId)
				bucketIds.push(characterBucketId);

			const subBucketHash = item.definition.inventory?.bucketTypeHash;
			if (subBucketHash !== itemRef.bucketHash) {
				const subBucketId = item.definition.inventory?.bucketTypeHash ? Bucket.id(itemRef.bucketHash, characterId, subBucketHash) as BucketId : undefined;
				if (subBucketId)
					bucketIds.push(subBucketId);
			}

			if (!characterId) {
				for (const classType of classTypes) {
					if (item.definition.classType === undefined || item.definition.classType === DestinyClass.Unknown)
						continue;

					const itemClassType = item.definition.classType as DestinyClass;
					if (itemClassType !== undefined && itemClassType !== DestinyClass.Unknown && itemClassType !== classType)
						// don't add this item to a bucket of this class type, its restricted to another class type
						continue;

					const characters = Characters.byClassType(classType);
					for (const character of characters) {
						const characterId = character.characterId;
						bucketIds.push(Bucket.id(itemRef.bucketHash, characterId) as BucketId);

						const subBucketHash = item.definition.inventory?.bucketTypeHash;
						if (subBucketHash !== itemRef.bucketHash) {
							const subBucketId = item.definition.inventory?.bucketTypeHash ? Bucket.id(itemRef.bucketHash, characterId, subBucketHash) as BucketId : undefined;
							if (subBucketId)
								bucketIds.push(subBucketId);
						}
					}
				}
			}

			const oldBucketIds = item.bucketIds;
			item.bucketIds = [];

			for (const bucketId of bucketIds) {
				const [, characterId, subBucketType] = Bucket.parseId(bucketId);
				const character = Characters.get(characterId);
				if (characterId && !character) {
					console.warn("Unknown character", characterId);
					continue;
				}

				const bucket = this.buckets[bucketId] ??= Bucket.create({
					definition: await DestinyInventoryBucketDefinition.get(itemRef.bucketHash),
					character,
					subBucketDefinition: await DestinyInventoryBucketDefinition.get(subBucketType),
				});
				if (!bucket)
					continue;

				item.bucketIds.push(bucketId);
			}

			for (const bucketId of oldBucketIds)
				if (!item.bucketIds.includes(bucketId))
					this.buckets[bucketId]?.removeItems(item);

			item.bucket = this.buckets[characterBucketId!] ?? this.buckets[genericBucketId]!;
			if (!item.bucket) {
				console.warn("Item was not bucketed", item);
				delete this.items[item.id];
				return;
			}

			for (const bucketId of item.bucketIds)
				if (!oldBucketIds.includes(bucketId))
					this.buckets[bucketId]?.addItems(item);

			await item.refresh(manifest, profile, itemRef, occurrence);

			if (item.shaped && item.deepsight?.pattern?.recipe && !item.isAdept())
				this.craftedItems.add(item.definition.hash);

			return item;
		};

		const unknownBuckets: DestinyItemComponent[] = [];
		const occurrences: Record<number, number> = {};

		for (const itemRef of profile.profileInventory?.data?.items ?? [])
			await refreshItem(itemRef);

		for (const [characterId, characterData] of Object.entries(profile.characterInventories?.data ?? {}))
			for (const itemRef of characterData.items)
				await refreshItem(itemRef, characterId as CharacterId);

		for (const [characterId, characterData] of Object.entries(profile.characterEquipment?.data ?? {}))
			for (const itemRef of characterData.items)
				await refreshItem(itemRef, characterId as CharacterId, true);


		////////////////////////////////////
		// Add collections bucket
		this.buckets["collections//"] = Bucket.COLLECTIONS;
		for (const { api, from, amount } of this.refreshWatchers)
			api.emitProgress(from + amount * (3 / 4), "Loading collections");

		const collectionsBucketHashes = this.hadInitialLoad ? undefined : new Set<InventoryBucketHashes>();
		const totalItemsToInit = this.hadInitialLoad ? 0 : collections.flatMap(moment => Object.values(moment.buckets)).flat().length;
		let initItems = 0;

		for (const moment of collections) {
			for (const [bucketId, itemHashes] of Object.entries(moment.buckets)) {
				collectionsBucketHashes?.add(+bucketId as InventoryBucketHashes);

				const momentName = this.hadInitialLoad ? undefined : moments.find(m => m.hash === moment.hash)?.displayProperties.name;
				for (const hash of itemHashes) {
					if (Date.now() - lastForcedTimeoutForStyle > 40) {
						await Async.sleep(0);
						lastForcedTimeoutForStyle = Date.now();
					}

					if (!this.hadInitialLoad) {
						initItems++;

						for (const { api, from, amount } of this.refreshWatchers)
							api.emitProgress(from + amount * (3 / 4) + (1 / 4) * (initItems / totalItemsToInit), [
								`Loading collections ${initItems} / ${totalItemsToInit}`,
								...momentName ? [momentName] : [],
							]);
					}

					const id = `hash:${hash}:collections` as ItemId;
					let item = this.items[id];
					if (!item) {
						const definition = await DestinyInventoryItemDefinition.get(hash);
						if (!definition)
							continue;

						item = await Item.createFake(manifest, profile, definition);
						Bucket.COLLECTIONS.addItems(item);
						this.items[id] = item;
						encountered.add(id);
					}

					await item.refresh(manifest, profile);
				}
			}
		}

		if (collectionsBucketHashes)
			for (const subBucketHash of collectionsBucketHashes)
				this.buckets[`collections//${subBucketHash}`] ??= new Bucket({
					definition: Bucket.COLLECTIONS.definition,
					subBucketDefinition: await manifest.DestinyInventoryBucketDefinition.get(subBucketHash),
					items: Bucket.COLLECTIONS.getItemsInSubBucket(subBucketHash),
				});

		for (const [itemId, item] of Object.entries(this.items))
			if (item && !encountered.has(itemId)) {
				for (const bucketId of item.bucketIds)
					this.buckets[bucketId]?.removeItems(item);

				delete this.items[itemId];
			}

		this.event.emit("update");
		delete this.refreshPromise;
		this.hadInitialLoad = true;
	}

	private refreshQueued = false;
	@Bound private async onProfileUpdate () {
		if (this.refreshQueued)
			return;

		this.refreshQueued = true;
		while (this.refreshPromise)
			await this.refreshPromise;

		this.refreshQueued = false;
		this.refreshPromise = this.refresh();
	}

	@Bound private onCharactersLoaded ({ characters, sorted }: EventParameter<typeof Characters, "loaded">) {
		for (const character of sorted)
			for (const loadout of character.loadouts)
				loadout.setInventory(this);
	}

	private interval?: number;
	@Bound private onPageFocusChange ({ focused }: { focused: boolean }) {
		if (focused)
			void this.queueProfileRefresh();
		clearInterval(this.interval);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this.interval = window.setInterval(this.queueProfileRefresh, focused ? Time.seconds(1) : Time.minutes(2));
	}
}

(Inventory as Mutable<typeof Inventory>).INSTANCE = new Inventory();
Object.assign(window, { inventory: Inventory.INSTANCE });

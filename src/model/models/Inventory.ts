import type { InventoryBucketHashes } from "@deepsight.gg/enums";
import type { IModelGenerationApi } from "model/Model";
import Model from "model/Model";
import type Character from "model/models/Characters";
import { ProfileCharacters } from "model/models/Characters";
import type { Bucket } from "model/models/Items";
import Items from "model/models/Items";
import type Item from "model/models/items/Item";
import type { IItemEvents, ItemId, OwnedBucketId } from "model/models/items/Item";
import { CharacterId } from "model/models/items/Item";
import Manifest from "model/models/Manifest";
import FocusManager from "ui/FocusManager";
import type { IItemComponentCharacterHandler } from "ui/inventory/ItemComponent";
import LoadingManager from "ui/LoadingManager";
import Arrays from "utility/Arrays";
import { EventManager } from "utility/EventManager";
import Time from "utility/Time";

interface IInventoryModelEvents {
	update: Event;
	itemUpdate: Event;
	dispose: Event;
}

Model.event.subscribe("clearCache", () => {
	Inventory["INSTANCE"]?.event.emit("dispose");
	clearInterval(Inventory["INSTANCE"]?.["interval"]);
	delete Inventory["INSTANCE"];
});

export default class Inventory implements IItemComponentCharacterHandler {

	private static INSTANCE?: Inventory;
	public static get () {
		return Inventory.INSTANCE ??= new Inventory();
	}

	public static createTemporary () {
		return Model.createTemporary(async progress => Inventory.get().await(progress));
	}

	public readonly event = new EventManager<this, IInventoryModelEvents>(this);

	public items?: Record<ItemId, Item>;
	public buckets?: Record<OwnedBucketId, Bucket>;
	public characters?: Record<CharacterId, Character>;
	public sortedCharacters?: Character[];
	public readonly craftedItems = new Set<number>();

	public get currentCharacter () {
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		return this.sortedCharacters?.[0]!;
	}

	public getCharacter (id?: CharacterId) {
		return this.characters?.[id!] ?? this.currentCharacter;
	}

	public constructor () {
		this.onItemBucketChange = this.onItemBucketChange.bind(this);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(window as any).inventory = this;

		const disposed = this.event.waitFor("dispose");
		Items.event.until(disposed, event => event
			.subscribe("loading", () => LoadingManager.start("inventory"))
			.subscribe("loaded", ({ value }) => this.updateItems(value)));

		ProfileCharacters.event.until(disposed, event => event
			// don't emit update separately for profile characters, that can be delayed to whenever the next item update is
			.subscribe("loaded", ({ value }) => {
				this.sortedCharacters = Object.values(value)
					.sort(({ dateLastPlayed: dateLastPlayedA }, { dateLastPlayed: dateLastPlayedB }) =>
						new Date(dateLastPlayedB).getTime() - new Date(dateLastPlayedA).getTime());
				this.characters = Object.fromEntries(this.sortedCharacters.map(character => [character.characterId, character]));
				for (const item of Object.values(this.items ?? {}))
					item["_owner"] = this.sortedCharacters[0].characterId as CharacterId;
			}));

		this.await = this.await.bind(this);
		this.onPageFocusChange = this.onPageFocusChange.bind(this);
		if (FocusManager.focused)
			this.onPageFocusChange(FocusManager);

		FocusManager.event.until(disposed, event => event
			.subscribe("changeFocusState", this.onPageFocusChange));
	}

	private shouldSkipCharacters?: () => boolean;
	public setShouldSkipCharacters (shouldSkip: () => boolean) {
		this.shouldSkipCharacters = shouldSkip;
		return this;
	}

	public async await (progress?: IModelGenerationApi) {
		if (this.shouldSkipCharacters?.() ?? false)
			return this;

		progress?.subscribeProgress(Manifest, 1 / 3);
		await Manifest.await();

		progress?.emitProgress(1 / 3, "Loading characters");
		progress?.subscribeProgress(ProfileCharacters, 1 / 3, 1 / 3);
		const charactersLoadedPromise = ProfileCharacters.await();
		if (!this.characters)
			await charactersLoadedPromise;

		progress?.emitProgress(2 / 3, "Loading items");
		progress?.subscribeProgress(Items, 1 / 3, 2 / 3);
		const itemsLoadedPromise = Items.await();
		if (!this.buckets)
			await itemsLoadedPromise;

		progress?.emitProgress(3 / 3);
		return this as Required<this>;
	}

	private updateItems (buckets: Record<OwnedBucketId, Bucket>) {
		this.craftedItems.clear(); // crafted items will be re-initialised through updateItem
		this.items ??= {};
		this.buckets = buckets;
		const iterableBuckets = Object.entries(this.buckets) as [OwnedBucketId, Bucket][];
		for (const [bucketId, bucket] of iterableBuckets)
			for (let i = 0; i < bucket.items.length; i++)
				this.updateItem(bucketId, bucket, i);

		for (const [bucketId, bucket] of iterableBuckets) {
			if (!CharacterId.is(bucketId)) continue;

			const equipped: Partial<Record<InventoryBucketHashes, Item>> = {};
			for (const item of bucket.items) {
				if (!item.equipped) continue;

				const bucketHash = item.definition.inventory?.bucketTypeHash as InventoryBucketHashes;
				if (!equipped[bucketHash]) {
					equipped[bucketHash] = item;
					continue;
				}

				if (item.shouldTrustBungie() && equipped[bucketHash]?.shouldTrustBungie()) {
					// replace equipped item
					delete equipped[bucketHash]!.equipped;
					equipped[bucketHash] = item;
				} else {
					delete item.equipped;
				}
			}
		}

		this.event.emit("update");
		LoadingManager.end("inventory");
	}

	private updateItem (bucketId: string, bucket: Bucket, itemIndex: number) {
		const items = this.items!;

		let item = bucket.items[itemIndex];
		// use old item if it exists
		item = items[item.id]?.update(item) ?? item;

		item["_owner"] = this.sortedCharacters?.[0].characterId as CharacterId;

		if (item.shaped)
			this.craftedItems.add(item.definition.hash);

		if (items[item.id] !== item)
			this.registerItem(item);

		items[item.id] = item;

		const buckets = this.buckets!;
		if (item.bucket !== bucketId) {
			buckets[item.bucket as OwnedBucketId].items.push(item);
			bucket.items.splice(itemIndex, 1);
			itemIndex--;
		} else {
			bucket.items[itemIndex] = items[item.id] = item;
		}
	}

	private registerItem (item: Item) {
		item.event.subscribe("bucketChange", this.onItemBucketChange);
	}

	private onItemBucketChange ({ item, oldBucket, equipped }: IItemEvents["bucketChange"]) {
		// and on its bucket changing, remove it from its old bucket and put it in its new one
		Arrays.remove(this.buckets![oldBucket]?.items, item);
		this.buckets![item.bucket as OwnedBucketId].items.push(item);

		// if this item is equipped now, make the previously equipped item not equipped
		if (equipped)
			for (const potentiallyEquippedItem of this.buckets![item.bucket as OwnedBucketId].items)
				if (potentiallyEquippedItem.equipped && potentiallyEquippedItem !== item)
					// only visually unequip items if they're in the same slot
					if (potentiallyEquippedItem.definition.equippingBlock?.equipmentSlotTypeHash === item.definition.equippingBlock?.equipmentSlotTypeHash)
						delete potentiallyEquippedItem.equipped;

		// inform listeners of inventory changes that an item has updated
		this.event.emit("itemUpdate");
	}

	private interval?: number;
	private onPageFocusChange ({ focused }: { focused: boolean }) {
		if (focused)
			void this.await();
		clearInterval(this.interval);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this.interval = window.setInterval(this.await, focused ? Time.seconds(5) : Time.minutes(2));
	}
}

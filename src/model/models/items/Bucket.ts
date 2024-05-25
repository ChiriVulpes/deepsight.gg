import { InventoryBucketHashes } from "@deepsight.gg/enums";
import { type DestinyDisplayPropertiesDefinition, type DestinyInventoryBucketDefinition } from "bungie-api-ts/destiny2";
import type { Character } from "model/models/Characters";
import type Item from "model/models/items/Item";
import type { CharacterId, ItemId } from "model/models/items/Item";
import Arrays from "utility/Arrays";

export type BucketId<BUCKET extends InventoryBucketHashes | "collections" = InventoryBucketHashes | "collections"> = `${BUCKET}/${CharacterId | ""}/${bigint | ""}`;

export interface BucketDefinition {
	definition: DestinyInventoryBucketDefinition;
	subBucketDefinition?: DestinyInventoryBucketDefinition;
	character?: Character;
	items?(): Item[];
}

export class Bucket {

	public static COLLECTIONS: CollectionsBucket;

	public static id<BUCKET extends InventoryBucketHashes = InventoryBucketHashes> (bucketHash: BUCKET, characterId?: CharacterId, inventoryBucketHash?: InventoryBucketHashes): BucketId<BUCKET> {
		return `${bucketHash}/${characterId || ""}/${inventoryBucketHash || ""}`;
	}

	public static parseId (id: BucketId) {
		const [bucketHashString, characterString, inventoryBucketHashString] = id.split(/\//g);
		return [
			bucketHashString === "collections" ? "collections" : +bucketHashString,
			characterString || undefined,
			+inventoryBucketHashString || undefined,
		] as [InventoryBucketHashes | "collections", CharacterId?, InventoryBucketHashes?];
	}

	public readonly id: BucketId;
	public readonly hash: InventoryBucketHashes;
	public readonly characterId?: CharacterId;
	public readonly inventoryHash?: InventoryBucketHashes;
	public readonly name: string;
	public readonly capacity: number;
	public deepsight: boolean;
	public fallbackRemovalItem?: Item;

	public readonly definition: DestinyInventoryBucketDefinition;
	public readonly character?: Character;
	public readonly subBucketDefinition?: DestinyInventoryBucketDefinition;
	public readonly items!: readonly Item[];
	protected map: Record<string, number>;
	private itemSupplier?: () => Item[];

	public constructor ({ definition, subBucketDefinition, character, items }: BucketDefinition) {
		this.name = definition.displayProperties?.name ?? "?";
		this.id = Bucket.id(definition.hash as InventoryBucketHashes, character?.characterId as CharacterId, subBucketDefinition?.hash);
		this.capacity = definition.itemCount;
		this.map = {};
		this.setItems(items);

		this.hash = definition.hash;
		this.inventoryHash = subBucketDefinition?.hash;
		this.characterId = character?.characterId;
		this.definition = definition;
		this.subBucketDefinition = subBucketDefinition;
		this.deepsight = !!items;

		if (character)
			this.name += ` / ${character.class.displayProperties.name}`;

		if (this.inventoryHash)
			this.name += ` / ${subBucketDefinition?.displayProperties?.name ?? "?"}`;
	}

	public isSubBucketOf (bucket: Bucket) {
		if (bucket === this)
			return false;

		const [hash, character] = Bucket.parseId(bucket.id);
		if (this.hash === hash && this.characterId === character)
			return true;

		return false;
	}

	public getItemById (id: ItemId) {
		return this.items[this.map[id]];
	}

	public regenerateItems () {
		if (this.itemSupplier) {
			this.setItems(this.itemSupplier);
		}
	}

	public setItems (items?: Item[] | (() => Item[])) {
		delete this.itemSupplier;
		this.deepsight = !!items;
		if (typeof items === "function")
			Object.defineProperty(this, "items", { value: (this.itemSupplier = items)(), configurable: true });
		else
			Object.defineProperty(this, "items", { value: items ?? [], configurable: true });

		this.map = {};
		for (let i = 0; i < this.items.length; i++)
			this.map[this.items[i].id] = i;
	}

	public addItems (...items: Item[]) {
		for (const item of items) {
			if (this.map[item.id] !== undefined)
				continue;

			this.map[item.id] = this.items.length;
			(this.items as Item[]).push(item);
		}
	}

	public removeItems (...items: Item[]) {
		const mutable = this.items as Item[];
		for (const item of items) {
			const removeIndex = this.map[item.id];
			if (removeIndex === undefined)
				continue;

			const lastItem = mutable.pop();
			mutable[removeIndex] = lastItem!;
			delete this.map[item.id];
			this.map[lastItem!.id] = removeIndex;
		}
	}

	public get equippedItem () {
		return this.items.find(item => item.equipped);
	}

	public is (hash: InventoryBucketHashes) {
		return this.hash === hash;
	}

	public isCollections () {
		return this.id.startsWith("collections");
	}

	public isVault () {
		return this.is(InventoryBucketHashes.General);
	}

	public isCharacter (character?: CharacterId): this is Bucket & { characterId: CharacterId } {
		return character === undefined ? !!this.characterId : this.characterId === character;
	}

	public isPostmaster () {
		return this.is(InventoryBucketHashes.LostItems);
	}

	public isEngrams () {
		return this.is(InventoryBucketHashes.Engrams);
	}

	public async makeSpace (swapBucket?: Bucket) {
		if (!this.fallbackRemovalItem)
			return false;

		if (swapBucket)
			return this.fallbackRemovalItem.transferToBucket(swapBucket).then(() => true).catch(() => false);

		return this.fallbackRemovalItem.transferToVault().then(() => true).catch(() => false);
	}

	public matches (item: Item) {
		if (item.bucket === this)
			return true;

		if (this.inventoryHash)
			return item.bucket.hash === this.definition.hash && item.definition.inventory?.bucketTypeHash === this.inventoryHash;

		return false
			|| item.bucket.hash === this.definition.hash
			|| item.definition.inventory?.bucketTypeHash === this.definition.hash;
	}
}

export class CollectionsBucket extends Bucket {
	private readonly subBuckets: Partial<Record<InventoryBucketHashes, number[]>> = {};

	public getItemsInSubBucket (bucketHash: InventoryBucketHashes) {
		return this.subBuckets[bucketHash]?.map(index => this.items[index]) ?? [];
	}

	public override addItems (...items: Item[]) {
		super.addItems(...items);
		for (const item of items) {
			const subBucketHash = item.definition.inventory?.bucketTypeHash as InventoryBucketHashes;
			if (subBucketHash === undefined)
				continue;

			const subBucket = this.subBuckets[subBucketHash] ??= [];
			const index = this.map[item.id];
			if (!subBucket.includes(index))
				subBucket.push(index);
		}
	}

	public override removeItems (...items: Item[]) {
		for (const item of items) {
			const subBucketHash = item.definition.inventory?.bucketTypeHash as InventoryBucketHashes;
			if (subBucketHash === undefined)
				continue;

			const subBucket = this.subBuckets[subBucketHash];
			if (!subBucket)
				continue;

			const index = this.map[item.id];
			Arrays.removeSwap(subBucket, index);
		}

		super.removeItems(...items);

		for (const item of items) {
			const subBucketHash = item.definition.inventory?.bucketTypeHash as InventoryBucketHashes;
			if (subBucketHash === undefined)
				continue;

			const subBucket = this.subBuckets[subBucketHash];
			if (!subBucket)
				continue;

			const index = this.map[item.id];
			if (index === undefined)
				continue;

			subBucket.push(index);
		}
	}
}

Bucket.COLLECTIONS = new CollectionsBucket({
	definition: {
		hash: "collections" as any as InventoryBucketHashes,
		displayProperties: {
			name: "Collections",
		} as DestinyDisplayPropertiesDefinition,
	} as DestinyInventoryBucketDefinition,
});

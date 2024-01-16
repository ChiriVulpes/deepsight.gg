import { InventoryBucketHashes } from "@deepsight.gg/enums";
import type { DestinyDisplayPropertiesDefinition, DestinyInventoryBucketDefinition } from "bungie-api-ts/destiny2";
import type { Character } from "model/models/Characters";
import type Item from "model/models/items/Item";
import type { CharacterId } from "model/models/items/Item";

export type BucketId<BUCKET extends InventoryBucketHashes = InventoryBucketHashes> = `${BUCKET}/${CharacterId | ""}/${bigint | ""}`;

export class Bucket {

	public static COLLECTIONS = new Bucket({
		definition: {
			hash: "collections" as any as InventoryBucketHashes,
			displayProperties: {
				name: "Collections",
			} as DestinyDisplayPropertiesDefinition,
		} as DestinyInventoryBucketDefinition,
	});

	public static id<BUCKET extends InventoryBucketHashes = InventoryBucketHashes> (bucketHash: BUCKET, characterId?: CharacterId, inventoryBucketHash?: InventoryBucketHashes): BucketId<BUCKET> {
		return `${bucketHash}/${characterId || ""}/${inventoryBucketHash || ""}`;
	}

	public static parseId (id: BucketId) {
		const [bucketHashString, characterString, inventoryBucketHashString] = id.split(/\//g);
		return [
			+bucketHashString,
			characterString || undefined,
			+inventoryBucketHashString || undefined,
		] as [InventoryBucketHashes, CharacterId?, InventoryBucketHashes?];
	}

	public readonly id: BucketId;
	public readonly hash: InventoryBucketHashes;
	public readonly characterId?: CharacterId;
	public readonly inventoryHash?: InventoryBucketHashes;
	public readonly name: string;
	public readonly capacity: number;
	public readonly deepsight: boolean;
	public fallbackRemovalItem?: Item;

	public readonly definition: DestinyInventoryBucketDefinition;
	public readonly character?: Character;
	public readonly subBucketDefinition?: DestinyInventoryBucketDefinition;
	public readonly items: Item[];

	public constructor ({ definition, subBucketDefinition, character, deepsight }: { definition: DestinyInventoryBucketDefinition, subBucketDefinition?: DestinyInventoryBucketDefinition, character?: Character, deepsight?: true }, items?: Item[]) {
		this.name = definition.displayProperties?.name ?? "?";
		this.id = Bucket.id(definition.hash as InventoryBucketHashes, character?.characterId as CharacterId, subBucketDefinition?.hash);
		this.capacity = definition.itemCount;
		this.items = items ?? [];

		if (this.inventoryHash)
			this.name += ` / ${subBucketDefinition?.displayProperties?.name ?? "?"}`;

		this.hash = definition.hash;
		this.inventoryHash = subBucketDefinition?.hash;
		this.characterId = character?.characterId;
		this.definition = definition;
		this.subBucketDefinition = subBucketDefinition;
		this.deepsight = deepsight ?? false;
	}

	public get equippedItem () {
		return this.items.find(item => item.equipped);
	}

	public is (hash: InventoryBucketHashes) {
		return this.hash === hash;
	}

	public isCollections () {
		return this === Bucket.COLLECTIONS;
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

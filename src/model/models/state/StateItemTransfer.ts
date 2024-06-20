import type { DestinyItemComponent } from "bungie-api-ts/destiny2";
import type { BucketId } from "model/models/items/Bucket";
import { Bucket } from "model/models/items/Bucket";
import type { ItemId } from "model/models/items/Item";
import IStateModification from "model/models/state/IStateModification";
import Arrays from "utility/Arrays";
import type { Mutable } from "utility/Type";

interface IStateModificationItemTransfer extends IStateModification {
	type: "item/transfer";
	item: ItemId;
	fromBucket: BucketId;
	fromEquipped: boolean;
	toBucket: BucketId;
	toEquipped: boolean;
}

export default IStateModification.register<IStateModificationItemTransfer>({
	type: "item/transfer",
	apply (profile, modification) {
		const [fromBucket, fromCharacterId, fromSubBucketDefinition] = Bucket.parseId(modification.fromBucket);
		if (fromSubBucketDefinition)
			throw new Error("Cannot transfer items from a sub bucket");

		const [toBucket, toCharacterId, toSubBucketDefinition] = Bucket.parseId(modification.toBucket);
		if (toSubBucketDefinition)
			throw new Error("Cannot transfer items to a sub bucket");

		if (fromBucket === "collections" || toBucket === "collections")
			throw new Error("Cannot transfer items to or from collections");

		const fromEquipped: keyof typeof profile = modification.fromEquipped ? "characterEquipment" : "characterInventories";
		const from = !fromCharacterId ? profile.profileInventory?.data?.items : profile[fromEquipped]?.data?.[fromCharacterId].items;
		if (!from)
			throw new Error(`Cannot find bucket '${modification.fromBucket}' to transfer item from`);

		const item = from.find(item => item.itemInstanceId === modification.item);
		if (!item)
			throw new Error(`Cannot find item '${modification.item}' in bucket '${modification.fromBucket}'`);

		if (item.bucketHash !== fromBucket)
			throw new Error(`Bad state! Expected item '${modification.item}' bucket state to be '${fromBucket}', was '${item.bucketHash}'`);

		const toEquipped: keyof typeof profile = modification.toEquipped ? "characterEquipment" : "characterInventories";
		const to = !toCharacterId ? profile.profileInventory?.data?.items : profile[toEquipped]?.data?.[toCharacterId].items;
		if (!to)
			throw new Error(`Cannot find bucket '${modification.fromBucket}' to transfer item to`);

		if (from !== to) {
			Arrays.removeSwap(from, item);
			to.push(item);
		}

		(item as Mutable<DestinyItemComponent>).bucketHash = toBucket;
	},
});

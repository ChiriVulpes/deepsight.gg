import { InventoryBucketHashes } from "@deepsight.gg/enums";
import { Bucket, BucketId } from "model/models/items/Item";
import BucketComponent from "ui/inventory/bucket/BucketComponent";
import CharacterBucket from "ui/inventory/bucket/CharacterBucket";
import ConsumablesBucket from "ui/inventory/bucket/ConsumablesBucket";
import ModificationsBucket from "ui/inventory/bucket/ModificationsBucket";
import PostmasterBucket from "ui/inventory/bucket/PostmasterBucket";
import VaultBucket from "ui/inventory/bucket/VaultBucket";
import InventoryView from "ui/view/inventory/InventoryView";

namespace BucketComponents {

	export function create (id: BucketId, view: InventoryView) {
		return createInternal(id, view) as BucketComponent;
	}

	function createInternal (id: BucketId, view: InventoryView) {
		const [hash] = Bucket.parseId(id);
		switch (hash) {
			case InventoryBucketHashes.General:
				return VaultBucket.create([view, id as BucketId<InventoryBucketHashes.General>]);
			case InventoryBucketHashes.LostItems:
				return PostmasterBucket.create([view, id as BucketId<InventoryBucketHashes.LostItems>]);
			case InventoryBucketHashes.Modifications:
				return ModificationsBucket.create([view, id as BucketId<InventoryBucketHashes.Modifications>]);
			case InventoryBucketHashes.Consumables:
				return ConsumablesBucket.create([view, id as BucketId<InventoryBucketHashes.Consumables>]);
			default:
				return CharacterBucket.create([view, id as BucketId]);
		}
	}
}

export default BucketComponents;

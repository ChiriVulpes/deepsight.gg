import { InventoryBucketHashes } from "@deepsight.gg/enums";
import type { BucketId } from "model/models/items/Bucket";
import { Bucket } from "model/models/items/Bucket";
import type BucketComponent from "ui/destiny/bucket/BucketComponent";
import CharacterBucket from "ui/destiny/bucket/CharacterBucket";
import ConsumablesBucket from "ui/destiny/bucket/ConsumablesBucket";
import ModificationsBucket from "ui/destiny/bucket/ModificationsBucket";
import PostmasterBucket from "ui/destiny/bucket/PostmasterBucket";
import VaultBucket from "ui/destiny/bucket/VaultBucket";
import type InventoryView from "ui/view/inventory/InventoryView";

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

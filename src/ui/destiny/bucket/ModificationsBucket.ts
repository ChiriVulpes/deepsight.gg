import { InventoryBucketHashes } from "@deepsight.gg/enums";
import { Bucket } from "model/models/items/Bucket";
import type Item from "model/models/items/Item";
import InventoryBucket from "ui/destiny/bucket/InventoryBucket";
import type InventoryView from "ui/view/inventory/InventoryView";

const handledBuckets = new Set([
	InventoryBucketHashes.KineticWeapons, InventoryBucketHashes.EnergyWeapons, InventoryBucketHashes.PowerWeapons,
	InventoryBucketHashes.Helmet, InventoryBucketHashes.Gauntlets, InventoryBucketHashes.ChestArmor, InventoryBucketHashes.LegArmor, InventoryBucketHashes.ClassArmor,
	InventoryBucketHashes.LostItems, InventoryBucketHashes.Engrams,
	InventoryBucketHashes.Consumables,
	InventoryBucketHashes.Ghost, InventoryBucketHashes.Vehicle, InventoryBucketHashes.Ships,
]);
export function isLeftoverModificationsVaultItem (item: Item) {
	return item.bucket.isVault()
		&& (!item.definition.inventory?.bucketTypeHash
			|| !handledBuckets.has(item.definition.inventory.bucketTypeHash));
}

export enum InventoryBucketClasses {
	Main = "view-inventory-inventory-bucket",
	EmptySlot = "view-inventory-inventory-slot-character-bucket-empty-slot",
	Content = "view-inventory-inventory-bucket-content",
}

export default class ModificationsBucket extends InventoryBucket {
	protected override onMake (view: InventoryView): void {
		super.onMake(view, Bucket.id(InventoryBucketHashes.Modifications));
		this.icon.style.set("--icon", "url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/modifications.svg\")");
		this.title.text.add("Modifications");
	}
}

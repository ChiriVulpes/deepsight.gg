import { InventoryBucketHashes } from "@deepsight.gg/enums";
import { Bucket } from "model/models/items/Item";
import { CardClasses } from "ui/Card";
import InventoryBucket from "ui/inventory/bucket/InventoryBucket";
import type InventoryView from "ui/view/inventory/InventoryView";

export enum InventoryBucketClasses {
	Main = "view-inventory-inventory-bucket",
	EmptySlot = "view-inventory-inventory-slot-character-bucket-empty-slot",
	Content = "view-inventory-inventory-bucket-content",
}

export default class ModificationsBucket extends InventoryBucket {
	protected override onMake (view: InventoryView): void {
		super.onMake(view, Bucket.id(InventoryBucketHashes.Modifications));
		this.setDisplayMode(CardClasses.DisplayModeSection);
		this.icon.style.set("--icon", "url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/modifications.svg\")");
		this.title.text.add("Modifications");
	}
}

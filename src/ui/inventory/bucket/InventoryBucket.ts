import type { BucketId } from "model/models/items/Item";
import BucketComponent from "ui/inventory/bucket/BucketComponent";
import type InventoryView from "ui/view/inventory/InventoryView";

export enum InventoryBucketClasses {
	Main = "view-inventory-inventory-bucket",
	EmptySlot = "view-inventory-inventory-slot-character-bucket-empty-slot",
	Content = "view-inventory-inventory-bucket-content",
}

export default class InventoryBucket extends BucketComponent {

	protected override onMake (view: InventoryView, bucketId: BucketId): void {
		super.onMake(view, bucketId);
		this.classes.add(InventoryBucketClasses.Main);
		this.content.classes.add(InventoryBucketClasses.Content);
	}

	public override render (requiredSlots = 50): void {
		super.render(requiredSlots);
	}

}
import Slot from "ui/inventory/Slot";
import BucketComponent from "ui/inventory/bucket/Bucket";

export enum InventoryBucketClasses {
	Main = "view-inventory-inventory-bucket",
	EmptySlot = "view-inventory-inventory-slot-character-bucket-empty-slot",
	Content = "view-inventory-inventory-bucket-content",
}

export default class InventoryBucket extends BucketComponent<[]> {

	protected override onMake (): void {
		super.onMake();
		this.classes.add(InventoryBucketClasses.Main);
		this.content.classes.add(InventoryBucketClasses.Content);
	}

	public update () {
		for (let i = this.content.element.childElementCount; i < 50; i++)
			Slot.create()
				.setEmpty()
				.appendTo(this.content);
	}
}
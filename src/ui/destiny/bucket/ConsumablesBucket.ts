import { InventoryBucketHashes } from "@deepsight.gg/enums";
import { Bucket } from "model/models/items/Bucket";
import InventoryBucket from "ui/destiny/bucket/InventoryBucket";
import type InventoryView from "ui/view/inventory/InventoryView";

export default class ConsumablesBucket extends InventoryBucket {
	protected override onMake (view: InventoryView): void {
		super.onMake(view, Bucket.id(InventoryBucketHashes.Consumables));
		this.icon.style.set("--icon", "url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/consumables.svg\")");
		this.title.text.add("Consumables");
	}
}

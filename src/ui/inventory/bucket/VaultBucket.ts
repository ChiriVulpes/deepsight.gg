import { InventoryBucketHashes } from "@deepsight.gg/enums";
import { Bucket, type BucketId } from "model/models/items/Item";
import { CardClasses } from "ui/Card";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import BucketComponent from "ui/inventory/bucket/BucketComponent";
import type InventoryView from "ui/view/inventory/InventoryView";

export enum VaultBucketClasses {
	Main = "view-inventory-slot-vault-bucket",
	Class = "view-inventory-slot-vault-bucket-class",
	Quantity = "view-inventory-slot-vault-bucket-quantity",
}

export default class VaultBucket extends BucketComponent<BucketId<InventoryBucketHashes.General>> {

	public classLabel?: Component;
	public quantityLabel!: Component;

	protected override onMake (view: InventoryView, bucketId?: BucketId<InventoryBucketHashes.General>): void {
		super.onMake(view, bucketId ?? Bucket.id(InventoryBucketHashes.General));
		this.classes.add(VaultBucketClasses.Main);
		this.setDisplayMode(CardClasses.DisplayModeSection);
		this.icon.style.set("--icon", "url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/vault2.svg\")");
		this.title.text.add("Vault");
		this.classLabel = Component.create()
			.classes.add(VaultBucketClasses.Class)
			.appendTo(this.title);

		this.quantityLabel = Component.create()
			.classes.add(VaultBucketClasses.Quantity)
			.appendTo(this.title);
	}

	public override update () {
		const className = this.character?.class?.displayProperties.name;
		this.classLabel?.classes.toggle(!className, Classes.Hidden)
			.text.set(`\xa0 (${className})`);

		const updated = super.update();
		if (!updated)
			return false;

		const vaultBucket = this.view?.inventory.getBucket(InventoryBucketHashes.General);
		const vaultItemCount = this.bucket?.items.length ?? 0;
		const vaultCapacity = this.bucket?.capacity;
		this.quantityLabel.classes.toggle(!vaultCapacity, Classes.Hidden);
		this.quantityLabel.text.set(`${(vaultItemCount)} / ${vaultBucket?.items.length ?? 0} / ${vaultCapacity}`);
		return true;
	}
}
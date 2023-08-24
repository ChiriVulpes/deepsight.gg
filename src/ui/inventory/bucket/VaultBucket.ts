import type Character from "model/models/Characters";
import type Inventory from "model/models/Inventory";
import { CardClasses } from "ui/Card";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import BucketComponent from "ui/inventory/bucket/Bucket";

export enum VaultBucketClasses {
	Main = "view-inventory-slot-vault-bucket",
	Class = "view-inventory-slot-vault-bucket-class",
	Quantity = "view-inventory-slot-vault-bucket-quantity",
}

export default class VaultBucket extends BucketComponent<[Character?]> {

	public character?: Character;

	public quantityLabel!: Component;

	protected override onMake (character?: Character): void {
		super.onMake(character);
		this.character = character;
		this.classes.add(VaultBucketClasses.Main);
		this.setDisplayMode(CardClasses.DisplayModeSection);
		this.icon.style.set("--icon", "url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/vault2.svg\")");
		this.title.text.add("Vault");
		const className = character?.class?.displayProperties.name;
		if (className)
			Component.create()
				.classes.add(VaultBucketClasses.Class)
				.text.set(`\xa0 (${className})`)
				.appendTo(this.title);

		this.quantityLabel = Component.create()
			.classes.add(VaultBucketClasses.Quantity)
			.appendTo(this.title);
	}

	public update (inventory: Inventory) {
		const vaultBucket = inventory.buckets?.vault;
		const vaultItemCount = vaultBucket?.items.length;
		const vaultCapacity = vaultBucket?.capacity;
		const renderedItemCount = this.content.element.childElementCount;
		this.quantityLabel.classes.toggle(!vaultCapacity, Classes.Hidden);
		if (!vaultCapacity)
			return;

		this.quantityLabel.text.set(`${(renderedItemCount)} / ${Math.max(renderedItemCount, vaultItemCount ?? 0)} / ${vaultCapacity}`);

	}
}
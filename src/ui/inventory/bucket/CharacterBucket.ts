import type { BucketId } from "model/models/items/Bucket";
import type Item from "model/models/items/Item";
import type Component from "ui/Component";
import type ItemComponent from "ui/inventory/ItemComponent";
import Slot from "ui/inventory/Slot";
import BucketComponent from "ui/inventory/bucket/BucketComponent";
import type InventoryView from "ui/view/inventory/InventoryView";
import Arrays from "utility/Arrays";

export enum CharacterBucketClasses {
	Main = "view-inventory-character-bucket",
	Emblem = "view-inventory-character-bucket-emblem",
	Equipped = "view-inventory-character-bucket-equipped",
	Inventory = "view-inventory-character-bucket-inventory",
}

export default class CharacterBucket extends BucketComponent {

	public equippedSlot!: Component;
	public equippedItem?: ItemComponent;

	protected override onMake (view: InventoryView, bucketId: BucketId): void {
		super.onMake(view, bucketId);
		this.classes.add(CharacterBucketClasses.Main);

		Slot.create()
			.classes.add(CharacterBucketClasses.Emblem)
			.appendTo(this.header);

		this.equippedSlot = Slot.create()
			.classes.add(CharacterBucketClasses.Equipped)
			.appendTo(this);

		this.content.classes.add(CharacterBucketClasses.Inventory);
		this.registerDropTarget(this.content);
		this.registerDropTarget(this.equippedSlot, true);
	}

	public override update () {
		const character = this.character;
		const className = character?.class?.displayProperties.name ?? "Unknown";
		this.icon.style.set("--icon",
			`url("https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_${className.toLowerCase()}.svg")`);

		this.title.text.set(className);

		this.style.set("--background", character && `url("https://www.bungie.net${character.emblem?.secondarySpecial ?? character.emblemBackgroundPath}")`)
			.style.set("--emblem", character && `url("https://www.bungie.net${character.emblem?.secondaryOverlay ?? character.emblemPath}")`);

		return super.update();
	}

	public override render (requiredSlots = 9): void {
		const equippedItemComponent = this.getItemComponent(this.bucket?.equippedItem);

		super.render(requiredSlots);

		equippedItemComponent?.appendTo(this.equippedSlot);
		if (equippedItemComponent && !this.itemComponents.includes(equippedItemComponent))
			this.itemComponents.push(equippedItemComponent);

		if (equippedItemComponent !== this.equippedItem) {
			if (this.equippedSlot.contains(this.equippedItem?.element)) {
				this.equippedItem?.remove();
				Arrays.removeSwap(this.itemComponents, this.equippedItem);
			}

			this.equippedItem = equippedItemComponent;
		}
	}

	public override shouldDisplayItem (item: Item): boolean {
		return !item.equipped;
	}

}

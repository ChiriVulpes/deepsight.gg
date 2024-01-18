import type { BucketId } from "model/models/items/Bucket";
import type Item from "model/models/items/Item";
import type Component from "ui/Component";
import Slot from "ui/inventory/Slot";
import BucketComponent from "ui/inventory/bucket/BucketComponent";
import type InventoryView from "ui/view/inventory/InventoryView";

export enum CharacterBucketClasses {
	Main = "view-inventory-character-bucket",
	Emblem = "view-inventory-character-bucket-emblem",
	Equipped = "view-inventory-character-bucket-equipped",
	Inventory = "view-inventory-character-bucket-inventory",
}

export default class CharacterBucket extends BucketComponent {

	public equippedSlot!: Component;

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
		super.render(requiredSlots);
		this.view?.getItemComponent(this.bucket?.equippedItem)
			?.setSortedBy(this.sorter)
			?.appendTo(this.equippedSlot);
	}

	public override shouldDisplayItem (item: Item): boolean {
		return !item.equipped;
	}

}

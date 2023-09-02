import type Character from "model/models/Characters";
import type Component from "ui/Component";
import Slot from "ui/inventory/Slot";
import BucketComponent from "ui/inventory/bucket/Bucket";

export enum CharacterBucketClasses {
	Main = "view-inventory-slot-character-bucket",
	Emblem = "view-inventory-slot-character-bucket-emblem",
	Equipped = "view-inventory-slot-character-bucket-equipped",
	Inventory = "view-inventory-slot-character-bucket-inventory",
}

export default class CharacterBucket extends BucketComponent<[]> {

	public character!: Character;
	public equippedSlot!: Component;

	protected override onMake (): void {
		super.onMake();
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

	public setCharacter (character: Character) {
		this.character = character;
		const className = character.class?.displayProperties.name ?? "Unknown";
		this.icon.style.set("--icon",
			`url("https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_${className.toLowerCase()}.svg")`);

		this.title.text.set(className);

		this.style.set("--background", `url("https://www.bungie.net${character.emblem?.secondarySpecial ?? character.emblemBackgroundPath}")`)
			.style.set("--emblem", `url("https://www.bungie.net${character.emblem?.secondaryOverlay ?? character.emblemPath}")`);
		return this;
	}

	public update () {
		const slotItems = this.content.element.childElementCount;
		for (let i = slotItems; i < 9; i++)
			Slot.create()
				.setEmpty()
				.appendTo(this.content);
	}
}

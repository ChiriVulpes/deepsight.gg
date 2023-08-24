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
	}

	public setCharacter (character: Character) {
		this.character = character;
		void this.initialiseFromCharacter(character);
		return this;
	}

	public update () {
		const slotItems = this.content.element.childElementCount;

		if (slotItems)
			for (let i = slotItems; i < 9; i++)
				Slot.create()
					.setEmpty()
					.appendTo(this.content);
	}
}

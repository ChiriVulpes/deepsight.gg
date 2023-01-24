import type Character from "model/models/Characters";
import { InventoryClasses } from "ui/Classes";
import Component from "ui/Component";
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

		Component.create()
			.classes.add(CharacterBucketClasses.Emblem, InventoryClasses.Slot)
			.appendTo(this.header);

		this.equippedSlot = Component.create()
			.classes.add(CharacterBucketClasses.Equipped, InventoryClasses.Slot)
			.appendTo(this);

		this.content.classes.add(CharacterBucketClasses.Inventory);
	}

	public setCharacter (character: Character) {
		this.character = character;
		void this.initialiseFromCharacter(character);
		return this;
	}
}

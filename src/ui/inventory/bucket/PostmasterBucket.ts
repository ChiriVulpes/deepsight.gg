import type Character from "model/models/Characters";
import { Classes, InventoryClasses } from "ui/Classes";
import Component from "ui/Component";
import BucketComponent from "ui/inventory/bucket/Bucket";

export enum PostmasterBucketClasses {
	Main = "view-inventory-slot-postmaster-bucket",
	Engrams = "view-inventory-slot-postmaster-bucket-engrams",
	Warning = "view-inventory-slot-postmaster-bucket-warning",
	EmptySlot = "view-inventory-slot-postmaster-bucket-empty-slot",
}

export default class PostmasterBucket extends BucketComponent<[]> {

	public character!: Character;
	public engrams!: Component;

	protected override onMake (): void {
		super.onMake();
		this.classes.add(PostmasterBucketClasses.Main);

		this.engrams = Component.create()
			.classes.add(PostmasterBucketClasses.Engrams);

		this.element.insertBefore(this.engrams.element, this.content.element);

		this.icon.style.set("--icon", "url(\"/image/svg/postmaster.svg\")");
		this.title.text.add("Postmaster");
	}

	public setCharacter (character: Character) {
		this.character = character;
		return this;
	}

	public update () {
		const postmasterItems = this.content.element.childElementCount;
		const engrams = this.engrams.element.childElementCount;
		this.classes.toggle(!postmasterItems && !engrams, Classes.Hidden)
			.classes.toggle(postmasterItems > 15, PostmasterBucketClasses.Warning);

		if (postmasterItems)
			for (let i = postmasterItems; i < 21; i++)
				Component.create()
					.classes.add(InventoryClasses.Slot, PostmasterBucketClasses.EmptySlot)
					.appendTo(this.content);

		if (engrams)
			for (let i = engrams; i < 10; i++)
				Component.create()
					.classes.add(InventoryClasses.Slot, PostmasterBucketClasses.EmptySlot)
					.appendTo(this.engrams);
	}
}
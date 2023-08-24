import type Character from "model/models/Characters";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Slot from "ui/inventory/Slot";
import BucketComponent from "ui/inventory/bucket/Bucket";

export enum PostmasterBucketClasses {
	Main = "view-inventory-slot-postmaster-bucket",
	Engrams = "view-inventory-slot-postmaster-bucket-engrams",
	Warning = "view-inventory-slot-postmaster-bucket-warning",
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
				Slot.create()
					.setEmpty()
					.setSimple()
					.appendTo(this.content);

		if (engrams)
			for (let i = engrams; i < 10; i++)
				Slot.create()
					.setEmpty()
					.setSimple()
					.appendTo(this.engrams);
	}
}
import { InventoryBucketHashes } from "@deepsight.gg/enums";
import { Bucket, type BucketId, type CharacterId } from "model/models/items/Item";
import { CardClasses } from "ui/Card";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import type Slot from "ui/inventory/Slot";
import BucketComponent from "ui/inventory/bucket/BucketComponent";
import type InventoryView from "ui/view/inventory/InventoryView";

export enum PostmasterBucketClasses {
	Main = "view-inventory-slot-postmaster-bucket",
	Engrams = "view-inventory-slot-postmaster-bucket-engrams",
	Warning = "view-inventory-slot-postmaster-bucket-warning",
	Class = "view-inventory-slot-postmaster-bucket-class",
}

export default class PostmasterBucket extends BucketComponent {

	public engrams!: BucketComponent;

	protected override onMake (view: InventoryView, bucketId: BucketId): void {
		super.onMake(view, bucketId);
		this.classes.add(PostmasterBucketClasses.Main);
		this.setDisplayMode(CardClasses.DisplayModeSection);

		this.engrams = EngramsBucket.create([view, Bucket.id(InventoryBucketHashes.Engrams, this.character?.characterId as CharacterId)])
			.classes.add(PostmasterBucketClasses.Engrams)
			.tweak(bucket => bucket.header.remove())
			.insertToBefore(this, this.contentWrapper);

		this.icon.style.set("--icon", "url(\"./image/svg/postmaster.svg\")");
		this.title.text.set("Postmaster");
	}

	public override update () {
		const character = this.character;
		const className = character?.class?.displayProperties.name;
		if (className)
			Component.create()
				.classes.add(PostmasterBucketClasses.Class)
				.text.set(`\xa0 (${className})`)
				.appendTo(this.title);

		const updated = super.update();
		const engramsUpdated = this.engrams.update();
		if (!updated && !engramsUpdated)
			return false;

		const items = this.itemComponents.length;
		const engrams = this.engrams.itemComponents.length;
		this.classes.toggle(!items && !engrams, Classes.Hidden)
			.classes.toggle(items > 15, PostmasterBucketClasses.Warning);

		return true;
	}

	public override render (requiredSlots = 21): void {
		super.render(requiredSlots);
	}

	public override createEmptySlot (): Slot {
		return super.createEmptySlot().setSimple();
	}
}

class EngramsBucket extends BucketComponent<BucketId<InventoryBucketHashes.Engrams>> {
	protected override onMake (view: InventoryView, bucketId: BucketId<InventoryBucketHashes.Engrams>): void {
		super.onMake(view, bucketId);
	}
}

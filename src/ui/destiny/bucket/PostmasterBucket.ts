import { InventoryBucketHashes } from "@deepsight.gg/enums";
import type { BucketId } from "model/models/items/Bucket";
import { Bucket } from "model/models/items/Bucket";
import type Item from "model/models/items/Item";
import type { CharacterId } from "model/models/items/Item";
import { CardClasses } from "ui/component/Card";
import Component from "ui/component/Component";
import BucketComponent from "ui/destiny/bucket/BucketComponent";
import type Slot from "ui/destiny/component/Slot";
import type FilterManager from "ui/destiny/filter/FilterManager";
import type SortManager from "ui/destiny/sort/SortManager";
import { Classes } from "ui/utility/Classes";
import type InventoryView from "ui/view/inventory/InventoryView";
import { InventorySlotViewHandler } from "ui/view/inventory/slot/IInventorySlotView";

export enum PostmasterBucketClasses {
	Main = "view-inventory-postmaster-bucket",
	Engrams = "view-inventory-postmaster-bucket-engrams",
	Warning = "view-inventory-postmaster-bucket-warning",
	Class = "view-inventory-postmaster-bucket-class",
}

export default class PostmasterBucket extends BucketComponent {

	public engrams!: BucketComponent;
	private className!: Component;

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

		this.className = Component.create()
			.classes.add(PostmasterBucketClasses.Class, Classes.Hidden)
			.appendTo(this.title);
	}

	public override setSortedAndFilteredBy (sort?: SortManager, filter?: FilterManager) {
		this.engrams.setSortedAndFilteredBy(sort, filter);
		return super.setSortedAndFilteredBy(sort, filter);
	}

	public override update () {
		const character = this.character;
		const className = character?.class?.displayProperties.name;
		if (className)
			this.className.classes.remove(Classes.Hidden)
				.text.set(`\xa0 / \xa0${className}`);

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

	protected override getSorter (item: Item) {
		return InventorySlotViewHandler.getSorter(item);
	}
}

class EngramsBucket extends BucketComponent<BucketId<InventoryBucketHashes.Engrams>> {
	protected override onMake (view: InventoryView, bucketId: BucketId<InventoryBucketHashes.Engrams>): void {
		super.onMake(view, bucketId);
	}

	public override render (requiredSlots = 10): void {
		super.render(requiredSlots);
	}

	public override createEmptySlot (): Slot {
		return super.createEmptySlot().setSimple();
	}
}

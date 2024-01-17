import type { InventoryBucketHashes } from "@deepsight.gg/enums";
import { TierType } from "bungie-api-ts/destiny2";
import Characters from "model/models/Characters";
import type { BucketId } from "model/models/items/Bucket";
import type Item from "model/models/items/Item";
import Card from "ui/Card";
import type Component from "ui/Component";
import type ItemComponent from "ui/inventory/ItemComponent";
import Slot from "ui/inventory/Slot";
import type SortManager from "ui/inventory/sort/SortManager";
import type InventoryView from "ui/view/inventory/InventoryView";

export enum BucketClasses {
	Main = "bucket",
	Header = "bucket-header",
	Title = "bucket-title",
	Icon = "bucket-icon",
	Inventory = "bucket-inventory",
	ItemList = "bucket-inventory-item-list",
	ItemListMain = "bucket-inventory-item-list-main",
}

interface BucketComponentDropTarget {
	component: Component;
	equipped: boolean;
}

export default abstract class BucketComponent<BUCKET_ID extends BucketId = BucketId> extends Card<[InventoryView, BUCKET_ID]> {

	public bucketId!: BucketId;

	private _view?: WeakRef<InventoryView>;
	private _sort?: WeakRef<SortManager>;

	public get view () {
		return this._view?.deref();
	}

	private dropTargets?: BucketComponentDropTarget[];
	public getDropTargets () {
		return this.dropTargets ?? [{ component: this, equipped: false }];
	}

	public get bucket () {
		return this.view?.inventory.buckets?.[this.bucketId];
	}

	public get owner () {
		return Characters.getOrCurrent(this.bucket?.characterId);
	}

	public get character () {
		return Characters.get(this.bucket?.characterId);
	}

	public items!: Item[];
	public itemComponents!: ItemComponent[];
	public slots!: Slot[];

	public get emptySlots () {
		return this.slots.filter(slot => slot.isEmpty());
	}

	protected override onMake (view: InventoryView, bucketId: BUCKET_ID) {
		super.onMake(view, bucketId);
		this.classes.add(BucketClasses.Main);
		this.header.classes.add(BucketClasses.Header);
		this.title.classes.add(BucketClasses.Title);
		this.icon.classes.add(BucketClasses.Icon);
		this.content.classes.add(BucketClasses.Inventory);

		this._view = new WeakRef(view);
		this.bucketId = bucketId;
		this.slots = [];
		this.itemComponents = [];
		this.items = [];
	}

	public is (...hashes: InventoryBucketHashes[]) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		return hashes.includes(this.bucket?.hash!);
	}

	public registerDropTarget (component: Component, equipped?: true) {
		this.dropTargets ??= [];
		this.dropTargets.push({ component, equipped: equipped ?? false });
	}

	public setSortedBy (sort: SortManager) {
		this._sort = new WeakRef(sort);
		this.update();
		return this;
	}

	public update () {
		const updated = this.sort();
		if (updated) {
			this.render();
		}

		return updated;
	}

	public shouldDisplayItem (item: Item) {
		return true;
	}

	public render (requiredSlots = 0) {
		const oldSlots = this.slots.splice(0, Infinity);
		this.itemComponents.splice(0, Infinity);

		let displayedItems = 0;
		for (const item of this.items) {
			if (item && !this.shouldDisplayItem(item))
				continue;

			const itemComponent = this.view?.getItemComponent(item);
			if (!itemComponent)
				continue;

			displayedItems++;
			const slot = Slot.create()
				.append(itemComponent)
				.appendTo(this.content);

			this.itemComponents.push(itemComponent);
			this.slots.push(slot);
		}

		for (let i = displayedItems; i < requiredSlots; i++) {
			const slot = this.createEmptySlot().appendTo(this.content);
			this.slots.push(slot);
		}

		for (const slot of oldSlots)
			slot.remove();
	}

	public createEmptySlot () {
		return Slot.create().setEmpty();
	}

	private sortHash?: string;
	private sort () {
		const sort = this._sort?.deref();
		if (!this.bucket || !sort)
			return false;

		const items = this.bucket.items.slice().sort(sort.sort);
		const sortHash = items.map(item => `${item.id}:${item.equipped}`).join(",");
		if (this.sortHash === sortHash)
			return false;

		this.sortHash = sortHash;
		this.bucket.fallbackRemovalItem = items[items.length - 1];

		const equippedItem = this.bucket?.equippedItem;
		if (equippedItem)
			equippedItem.fallbackItem = undefined
				?? items.find(item => item !== equippedItem
					&& (item.isTierLessThan(equippedItem.tier?.tierType, TierType.Superior)))
				?? this.view?.getVaultBucket(this.bucket?.characterId)?.items.find(item => item !== equippedItem
					&& this.bucket?.matches(item)
					&& item.isTierLessThan(equippedItem.tier?.tierType, TierType.Superior));

		this.items = items;
		return true;
	}
}

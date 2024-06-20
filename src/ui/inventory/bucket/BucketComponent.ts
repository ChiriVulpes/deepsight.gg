import type { InventoryBucketHashes } from "@deepsight.gg/enums";
import { TierType } from "bungie-api-ts/destiny2";
import Characters from "model/models/Characters";
import { Bucket, type BucketId } from "model/models/items/Bucket";
import type Item from "model/models/items/Item";
import Card from "ui/Card";
import type Component from "ui/Component";
import { ItemClasses } from "ui/inventory/IItemComponent";
import type ItemComponent from "ui/inventory/ItemComponent";
import Slot from "ui/inventory/Slot";
import type FilterManager from "ui/inventory/filter/FilterManager";
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
	private _filter?: WeakRef<FilterManager>;

	public get view () {
		return this._view?.deref();
	}

	private dropTargets?: BucketComponentDropTarget[];
	public getDropTargets () {
		return this.dropTargets ?? [{ component: this, equipped: false }];
	}

	public get bucket () {
		return this.view?.inventory.getBucket(this.bucketId);
	}

	public get owner () {
		const [, characterId] = Bucket.parseId(this.bucketId);
		return Characters.getOrCurrent(characterId);
	}

	public get character () {
		const [, characterId] = Bucket.parseId(this.bucketId);
		return Characters.get(characterId);
	}

	public get sorter () {
		return this._sort?.deref();
	}

	public get filterer () {
		return this._filter?.deref();
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

	public setSortedAndFilteredBy (sort?: SortManager, filter?: FilterManager) {
		this._sort = sort && new WeakRef(sort);
		this._filter = filter && new WeakRef(filter);
		this.update();
		return this;
	}

	public update () {
		const updated = this.sort();
		if (updated) {
			this.render();
		}

		for (const item of this.itemComponents) {
			const filteredOut = !!item.item && !!this.filterer && !this.filterer.apply(item.item);
			item.classes.toggle(filteredOut, ItemClasses._FilteredOut)
				.attributes.toggle(filteredOut, "tabindex", "-1");
		}

		return updated;
	}

	public shouldDisplayItem (item: Item) {
		return true;
	}

	public render (requiredSlots = 0) {
		const oldSlots = this.slots.splice(0, Infinity);
		const newItemComponents: ItemComponent[] = [];

		let displayedItems = 0;
		for (const item of this.items) {
			if (item && !this.shouldDisplayItem(item))
				continue;

			const itemComponent = this.getItemComponent(item);
			if (!itemComponent)
				continue;

			displayedItems++;
			const slot = Slot.create()
				.append(itemComponent)
				.appendTo(this.content);

			newItemComponents.push(itemComponent);
			this.slots.push(slot);
		}

		for (let i = displayedItems; i < requiredSlots; i++) {
			const slot = this.createEmptySlot().appendTo(this.content);
			this.slots.push(slot);
		}

		for (const slot of oldSlots)
			slot.remove();

		this.itemComponents = newItemComponents;
	}

	public createEmptySlot () {
		return Slot.create().setEmpty();
	}

	protected getSorter (item: Item) {
		return this.sorter;
	}

	protected getItemComponent (item?: Item) {
		if (!item)
			return undefined;

		let component = this.itemComponents.find(c => c.item?.id === item.id);
		if (!component) {
			component = this.view?.createItemComponent(item)
				?.setSortedBy(this.getSorter(item));

			if (component)
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				this.itemComponents.push(component);
		}

		return component;
	}

	private sortHash?: string;
	private sort () {
		const sort = this.sorter;
		if (!this.bucket || !sort)
			return false;

		const items = this.bucket.items.slice().sort(sort.sort);
		const sortHash = items.map(item => `${item.id}:${+!!item.equipped}`).join(",");
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

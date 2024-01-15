import { DestinyInventoryBucketDefinition, TierType } from "bungie-api-ts/destiny2";
import Characters from "model/models/Characters";
import Manifest from "model/models/Manifest";
import type Item from "model/models/items/Item";
import { Bucket, type BucketId } from "model/models/items/Item";
import Card from "ui/Card";
import type Component from "ui/Component";
import type ItemComponent from "ui/inventory/ItemComponent";
import Slot from "ui/inventory/Slot";
import type SortManager from "ui/inventory/sort/SortManager";
import type InventoryView from "ui/view/inventory/InventoryView";

let bucketDefs: DestinyInventoryBucketDefinition[] = [];
Manifest.event.subscribe("loaded", async ({ value: Manifest }) =>
	bucketDefs = await Manifest.DestinyInventoryBucketDefinition.all());

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
		if (!this.view?.inventory.buckets)
			return undefined;

		const bucket = this.view.inventory.buckets[this.bucketId];
		if (bucket)
			return bucket;

		const [hash, characterId, subInventoryHash] = Bucket.parseId(this.bucketId);
		if (!subInventoryHash) {
			const definition = bucketDefs.find(def => def.hash === hash);
			if (!definition)
				return undefined;

			return this.view.inventory.buckets[this.bucketId] = new Bucket({
				definition,
				character: Characters.get(characterId),
			});
		}

		const mainBucket = this.view.inventory.buckets[`${hash}//`];
		if (!mainBucket)
			return undefined;

		const subBucketDefinition = bucketDefs.find(def => def.hash === subInventoryHash);
		if (!subBucketDefinition)
			return undefined;

		const subBucket = new Bucket({
			definition: mainBucket.definition,
			character: Characters.get(characterId),
			subBucketDefinition,
		}, mainBucket.items.filter(item => item.definition.inventory?.bucketTypeHash === subInventoryHash));
		return this.view.inventory.buckets[subBucket.id] = subBucket;
	}

	public get owner () {
		return Characters.getOrCurrent(this.bucket?.characterId);
	}

	public get character () {
		return Characters.get(this.bucket?.characterId);
	}

	public get items (): Item[] {
		return this.bucket?.items ?? [];
	}

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
		this.slots.splice(0, Infinity);
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
	}

	public createEmptySlot () {
		return Slot.create().setEmpty();
	}

	private sortHash?: string;
	private sort () {
		const sort = this._sort?.deref();
		if (!this.bucket || !sort)
			return false;

		this.bucket.items.sort(sort.sort);
		const sortHash = this.bucket.items.map(item => item.id).join(",");
		if (this.sortHash === sortHash)
			return false;

		this.sortHash = sortHash;
		this.bucket.fallbackRemovalItem = this.bucket.items[this.bucket.items.length - 1];

		const equippedItem = this.bucket?.equippedItem;
		if (equippedItem)
			equippedItem.fallbackItem = undefined
				?? this.bucket.items.find(item => item !== equippedItem
					&& (item.isTierLessThan(equippedItem.tier?.tierType, TierType.Superior)))
				?? this.view?.getVaultBucket(this.bucket?.characterId)?.items.find(item => item !== equippedItem
					&& this.bucket?.matches(item)
					&& item.isTierLessThan(equippedItem.tier?.tierType, TierType.Superior));

		return true;
	}
}

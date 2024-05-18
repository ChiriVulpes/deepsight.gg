import { InventoryBucketHashes } from "@deepsight.gg/enums";
import Characters from "model/models/Characters";
import type Inventory from "model/models/Inventory";
import type { BucketId } from "model/models/items/Bucket";
import { Bucket } from "model/models/items/Bucket";
import type { CharacterId } from "model/models/items/Item";
import Item from "model/models/items/Item";
import { Classes } from "ui/Classes";
import type { AnyComponent } from "ui/Component";
import Component from "ui/Component";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import View from "ui/View";
import DraggableItem from "ui/inventory/DraggableItemComponent";
import HintsDrawer from "ui/inventory/HintsDrawer";
import { ItemClasses } from "ui/inventory/IItemComponent";
import ItemComponent from "ui/inventory/ItemComponent";
import type BucketComponent from "ui/inventory/bucket/BucketComponent";
import BucketComponents from "ui/inventory/bucket/BucketComponents";
import FilterManager from "ui/inventory/filter/FilterManager";
import ItemFilter from "ui/inventory/filter/ItemFilter";
import ItemSort from "ui/inventory/sort/ItemSort";
import type SortManager from "ui/inventory/sort/SortManager";
import Arrays from "utility/Arrays";
import Bound from "utility/decorator/Bound";
import type { IVector2 } from "utility/maths/Vector2";

export enum InventoryViewClasses {
	Main = "view-inventory",
	Content = "view-inventory-content",
	Footer = "view-inventory-footer",
	SlotPendingRemoval = "view-inventory-pending-removal",
	HighestPower = "view-inventory-highest-power",
	ItemMoving = "view-inventory-item-moving",
	ItemMovingOriginal = "view-inventory-item-moving-original",
	BucketDropTarget = "view-inventory-bucket-drop-target",
	BucketMovingFrom = "view-inventory-bucket-moving-from",
	ItemFilteredOut = "view-inventory-item-filtered-out",
	LayoutColumns = "view-inventory-layout-columns",
	LayoutRows = "view-inventory-layout-rows",
	LayoutBucket = "view-inventory-layout-bucket",
}

export interface IInventoryViewDefinition {
	sort: SortManager;
	layout?: (view: InventoryView) => any;
	filter: FilterManager;
	onItemMoveStart?(view: InventoryView, wrapper: InventoryViewWrapper, item: Item, event: Event & { mouse: IVector2 }): any;
}

class InventoryViewWrapper extends View.WrapperComponent<[], [], View.IViewBase<[]> & IInventoryViewDefinition> { }

type InventoryViewArgs = [Inventory];
export default class InventoryView extends Component.makeable<HTMLElement, InventoryViewArgs>().of(InventoryViewWrapper) {

	public static hasExisted?: true;
	public static current?: InventoryView;

	public inventory!: Inventory;
	public bucketComponents!: Partial<Record<BucketId, BucketComponent>>;
	public itemMap!: Map<Item, ItemComponent>;
	public hints!: HintsDrawer;
	public equipped!: Partial<Record<BucketId, ItemComponent>>;
	public sorter!: ItemSort;
	public filterer!: ItemFilter;

	protected override async onMake (inventory: Inventory) {
		InventoryView.hasExisted = true;
		InventoryView.current = this;
		this.inventory = inventory;
		inventory.setShouldSkipRefresh(() => !InventoryView.current);

		this.classes.add(InventoryViewClasses.Main);
		this.super.content.classes.add(InventoryViewClasses.Content);

		if (!Characters.hasAny()) {
			this.super.setTitle(title => title.text.set("No Guardians Were Found..."));
			this.super.setSubtitle("small", subtitle => subtitle.text.set("Your ghost continues its search..."));
			return;
		}

		this.bucketComponents = {};
		this.equipped = {};
		this.itemMap = new Map<Item, ItemComponent>();

		this.super.definition.layout?.(this);

		inventory.event.subscribe("update", this.update);
		this.event.subscribe("hide", () => {
			inventory.event.unsubscribe("update", this.update);
			if (InventoryView.current === this)
				delete InventoryView.current;
		});

		this.preUpdateInit();
		this.update();

		this.super.footer.classes.add(InventoryViewClasses.Footer);

		await FilterManager.init();
		this.initSortAndFilter();

		this.hints = HintsDrawer.create()
			.tweak(hints => View.registerFooterButton(hints.button))
			.tweak(hints => hints.buttonLabel.classes.add(View.Classes.FooterButtonLabel))
			.tweak(hints => hints.buttonText.classes.add(View.Classes.FooterButtonText))
			.appendTo(this.super.footer);

		UiEventBus.subscribe("keydown", this.onGlobalKeydown);
	}

	@Bound public addBuckets (bucketIds: Arrays.Or<BucketId>, initialiser?: (bucketComponent: BucketComponent) => any) {
		for (const bucketId of Arrays.resolve(bucketIds))
			this.bucketComponents[bucketId] = BucketComponents.create(bucketId, this)
				.setSortedBy(this.super.definition.sort)
				.tweak(initialiser)
				.appendTo(this.super.content);
		return this;
	}

	@Bound public addBucketsTo (component: AnyComponent, bucketIds: Arrays.Or<BucketId>, initialiser?: (bucketComponent: BucketComponent) => any) {
		for (const bucketId of Arrays.resolve(bucketIds))
			this.bucketComponents[bucketId] = BucketComponents.create(bucketId, this)
				.setSortedBy(this.super.definition.sort)
				.tweak(initialiser)
				.appendTo(component);
		return this;
	}

	public getBuckets () {
		return Object.values(this.bucketComponents ?? {});
	}

	public getBucket (item?: Item): BucketComponent | undefined;
	public getBucket (bucket?: Bucket): BucketComponent | undefined;
	public getBucket (bucketId?: BucketId): BucketComponent | undefined;
	public getBucket (value?: Item | Bucket | BucketId) {
		if (!value)
			return undefined;

		const bucket = this.bucketComponents[typeof value === "string" ? value : value instanceof Bucket ? value.id : value.bucket.id];
		if (bucket)
			return bucket;

		return !(value instanceof Item) ? undefined
			: Object.values(this.bucketComponents)
				.find(bucket => bucket?.items.includes(value));
	}

	public getVaultBucket (character?: CharacterId) {
		return (character && this.bucketComponents[Bucket.id(InventoryBucketHashes.General, character)])
			?? this.bucketComponents[Bucket.id(InventoryBucketHashes.General)];
	}

	public getPostmasterBucket (character?: CharacterId) {
		return character && this.bucketComponents[Bucket.id(InventoryBucketHashes.LostItems, character)];
	}

	public getItemComponent (item?: Item) {
		if (!item)
			return undefined;

		let itemComponent = this.itemMap.get(item);
		if (itemComponent)
			return itemComponent;

		itemComponent = this.createItemComponent(item);
		this.itemMap.set(item, itemComponent);

		return itemComponent;
	}

	protected preUpdateInit () { }

	protected initSortAndFilter () {
		this.sorter = ItemSort.create([this.super.definition.sort])
			.event.subscribe("sort", this.sort)
			.tweak(itemSort => View.registerFooterButton(itemSort.button))
			.tweak(itemSort => itemSort.label.classes.add(View.Classes.FooterButtonLabel))
			.tweak(itemSort => itemSort.sortText.classes.add(View.Classes.FooterButtonText))
			.appendTo(this.super.footer);

		this.filterer = ItemFilter.getFor(this.super.definition.filter)
			.event.subscribe("filter", this.filter)
			.event.subscribe("submit", () =>
				document.querySelector<HTMLButtonElement>(`.${ItemClasses.Main}:not([tabindex="-1"])`)?.focus())
			.tweak(itemFilter => View.registerFooterButton(itemFilter.button))
			.tweak(itemFilter => itemFilter.label.classes.add(View.Classes.FooterButtonLabel))
			.tweak(itemFilter => itemFilter.input.classes.add(View.Classes.FooterButtonText))
			.appendTo(this.super.footer);

		this.filter();
	}

	@Bound
	private update () {
		this.updateItems();
		this.sort();
		this.filter();
	}

	private updateItems () {
		const bucketEntries = Object.entries(this.inventory.buckets ?? {}) as [BucketId, Bucket][];
		for (const [item, component] of this.itemMap) {
			if (!bucketEntries.some(([, bucket]) => bucket.items.includes(item))) {
				// this item doesn't exist anymore
				component.remove();
				this.itemMap.delete(item);
			}
		}
	}

	@Bound
	private sort () {
		for (const bucket of Object.values(this.bucketComponents)) {
			bucket?.update();
		}
	}

	@Bound
	private filter () {
		for (const [item, component] of this.itemMap) {
			const filteredOut = !this.super.definition.filter.apply(item);
			component.classes.toggle(filteredOut, InventoryViewClasses.ItemFilteredOut)
				.attributes.toggle(filteredOut, "tabindex", "-1");
		}
	}

	@Bound
	protected onGlobalKeydown (event: IKeyEvent) {
		if (!document.contains(this.element)) {
			UiEventBus.unsubscribe("keydown", this.onGlobalKeydown);
			return;
		}

		if (this.hints.drawer.isOpen() && event.useOverInput("Escape")) {
			this.hints.drawer.close(true);
		}

		if (this.filterer.isFiltered() && event.use("Escape")) {
			this.filterer.reset();
		}
	}

	protected onItemMoveStart (item: Item, event: Event & { mouse: IVector2 }) {
		this.super.definition.onItemMoveStart?.(this, this.super, item, event);
	}

	private itemMoving?: ItemComponent;
	protected createItemComponent (item: Item) {
		item.event.subscribe("bucketChange", this.update);
		if (!item.canTransfer())
			return ItemComponent.create([item, this.inventory]);

		return DraggableItem.create([item, this.inventory, {
			createItemPlaceholder: item => {
				this.itemMoving?.remove();
				this.itemMoving = item.appendTo(this);
			},
			disposeItemPlaceholder: item => {
				if (this.itemMoving === item)
					delete this.itemMoving;
			},
			moveStart: event => {
				if (window.innerWidth <= 800)
					return event.preventDefault();

				this.getBucket(item)
					?.classes.add(InventoryViewClasses.BucketMovingFrom);

				this.onItemMoveStart(item, event);
			},
			move: event => {
				for (const bucket of this.getBuckets()) {
					if (!bucket || bucket.is(InventoryBucketHashes.Consumables, InventoryBucketHashes.Modifications, InventoryBucketHashes.LostItems))
						continue;

					for (const { component } of bucket.getDropTargets())
						component.classes.toggle(
							component.intersects(event.mouse, true) && !component.element.matches(`.${Classes.Hidden} *`),
							InventoryViewClasses.BucketDropTarget);
				}
			},
			moveEnd: async event => {
				this.getBucket(item)
					?.classes.remove(InventoryViewClasses.BucketMovingFrom);

				let dropBucket: BucketComponent | undefined;
				let dropEquipped = false;
				for (const bucket of this.getBuckets()) {
					if (!bucket || bucket.is(InventoryBucketHashes.Consumables, InventoryBucketHashes.Modifications, InventoryBucketHashes.LostItems, InventoryBucketHashes.Subclass))
						continue;

					let intersections = false;
					for (const { component, equipped } of bucket.getDropTargets()) {
						component.classes.remove(InventoryViewClasses.BucketDropTarget);
						if (!intersections && !dropBucket && component.intersects(event.mouse, true) && !component.element.matches(`.${Classes.Hidden} *`)) {
							intersections = true;
							dropEquipped = equipped;
						}
					}

					if (!intersections || dropBucket)
						continue;

					dropBucket = bucket;
				}

				if (!dropBucket?.bucket)
					return;

				if (item.bucket.id === dropBucket.bucket.id && item.equipped === dropEquipped)
					return;

				if (dropBucket.bucket.isCharacter()) {
					if (dropEquipped)
						return item.equip(dropBucket.bucket.characterId);
					else if (item.equipped && item.bucket.id === dropBucket.bucket.id)
						return item.unequip();
				}

				await item.transferToBucket(dropBucket.bucket);
			},
		}]);
	}
}

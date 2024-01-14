import { InventoryBucketHashes } from "@deepsight.gg/enums";
import Characters from "model/models/Characters";
import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type { BucketId, CharacterId } from "model/models/items/Item";
import { Bucket } from "model/models/items/Item";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import { Hint, IInput } from "ui/Hints";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import View from "ui/View";
import Button, { ButtonClasses } from "ui/form/Button";
import Drawer from "ui/form/Drawer";
import DraggableItem from "ui/inventory/DraggableItemComponent";
import ItemComponent, { ItemClasses } from "ui/inventory/ItemComponent";
import BucketComponent from "ui/inventory/bucket/BucketComponent";
import FilterManager from "ui/inventory/filter/FilterManager";
import ItemFilter from "ui/inventory/filter/ItemFilter";
import ItemSort from "ui/inventory/sort/ItemSort";
import SortManager from "ui/inventory/sort/SortManager";
import Arrays from "utility/Arrays";
import Store from "utility/Store";
import Bound from "utility/decorator/Bound";
import type { IVector2 } from "utility/maths/Vector2";

export enum InventoryViewClasses {
	Main = "view-inventory-slot",
	Content = "view-inventory-slot-content",
	Footer = "view-inventory-slot-footer",
	SlotPendingRemoval = "view-inventory-slot-pending-removal",
	HighestPower = "view-inventory-slot-highest-power",
	ItemMoving = "view-inventory-slot-item-moving",
	ItemMovingOriginal = "view-inventory-slot-item-moving-original",
	BucketDropTarget = "view-inventory-slot-bucket-drop-target",
	BucketMovingFrom = "view-inventory-slot-bucket-moving-from",
	Hints = "view-inventory-slot-hints",
	HintsButton = "view-inventory-slot-hints-button",
	HintsDrawer = "view-inventory-slot-hints-drawer",
	Hint = "view-inventory-slot-hint",
	HintIcon = "view-inventory-slot-hint-icon",
	ItemFilteredOut = "view-inventory-slot-item-filtered-out",
}

export interface IInventoryViewDefinition {
	sort: SortManager;
	slot?: Arrays.Or<Arrays.Or<InventoryBucketHashes>>;
	filter: FilterManager;
	separateVaults?: true;
}

export namespace IInventoryViewDefinition {
	export function resolveSlotId (slot: Arrays.Or<InventoryBucketHashes>) {
		return Array.isArray(slot) ? slot.join(",") : slot;
	}

	export function resolveSlotIds (slot?: IInventoryViewDefinition["slot"]) {
		return Arrays.resolve(slot).map(slot => Array.isArray(slot) ? slot.join(",") : slot);
	}

	const handledBuckets = new Set([
		InventoryBucketHashes.KineticWeapons, InventoryBucketHashes.EnergyWeapons, InventoryBucketHashes.PowerWeapons,
		InventoryBucketHashes.Helmet, InventoryBucketHashes.Gauntlets, InventoryBucketHashes.ChestArmor, InventoryBucketHashes.LegArmor, InventoryBucketHashes.ClassArmor,
		InventoryBucketHashes.LostItems, InventoryBucketHashes.Engrams,
		InventoryBucketHashes.Consumables,
		InventoryBucketHashes.Ghost, InventoryBucketHashes.Vehicle, InventoryBucketHashes.Ships,
	]);
	export function isLeftoverModificationsVaultItem (item: Item) {
		return item.bucket.isVault()
			&& (!item.definition.inventory?.bucketTypeHash
				|| !handledBuckets.has(item.definition.inventory.bucketTypeHash));
	}
}

class InventoryViewWrapper extends View.WrapperComponent<[], [], View.IViewBase<[]> & IInventoryViewDefinition> { }

type InventoryViewArgs = [Inventory];
export default class InventoryView extends Component.makeable<HTMLElement, InventoryViewArgs>().of(InventoryViewWrapper) {

	public static hasExisted?: true;
	public static current?: InventoryView;

	public inventory!: Inventory;
	public bucketComponents!: Partial<Record<BucketId, BucketComponent>>;
	public itemMap!: Map<Item, ItemComponent>;
	public hints!: Component;
	public hintsDrawer!: Drawer;
	public equipped!: Partial<Record<BucketId, ItemComponent>>;
	public sorter!: ItemSort;
	public filterer!: ItemFilter;

	protected override async onMake (inventory: Inventory) {
		InventoryView.hasExisted = true;
		InventoryView.current = this;
		this.inventory = inventory;
		inventory.setShouldSkipCharacters(() => !InventoryView.current);

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

		inventory.event.subscribe("update", this.update);
		this.event.subscribe("hide", () => {
			inventory.event.unsubscribe("update", this.update);
			if (InventoryView.current === this)
				delete InventoryView.current;
		});

		await SortManager.init();

		this.preUpdateInit();
		this.update();

		this.super.footer.classes.add(InventoryViewClasses.Footer);

		await FilterManager.init();
		this.initSortAndFilter();

		this.hints = Component.create()
			.classes.add(InventoryViewClasses.Hints)
			.event.subscribe("mouseenter", () => this.hintsDrawer.open("mouse"))
			.event.subscribe("mouseleave", () => this.hintsDrawer.close("mouse"))
			.appendTo(this.super.footer);

		Button.create()
			.classes.remove(ButtonClasses.Main)
			.classes.add(InventoryViewClasses.HintsButton, View.Classes.FooterButton)
			.addIcon(icon => icon.classes.add(InventoryViewClasses.HintIcon))
			.tweak(button => button.innerIcon?.classes.add(View.Classes.FooterButtonIcon))
			.append(Component.create()
				.classes.add(View.Classes.FooterButtonLabel)
				.text.set("Help"))
			.append(Component.create()
				.classes.add(View.Classes.FooterButtonText)
				.text.set("Keybinds & more"))
			.event.subscribe("click", () => this.hintsDrawer.toggle("click"))
			.appendTo(this.hints);

		this.hintsDrawer = Drawer.create()
			.classes.add(InventoryViewClasses.HintsDrawer)
			.appendTo(this.hints);

		this.hintsDrawer.createPanel()
			.append(Component.create("p")
				.classes.add(InventoryViewClasses.Hint)
				.append(Hint.create([IInput.get("KeyF1")]))
				.text.add("\xa0 Player overview"))
			.append(Component.create("p")
				.classes.add(InventoryViewClasses.Hint)
				.classes.toggle(!!Store.items.settingsAlwaysShowExtra, Classes.Hidden)
				.append(Hint.create([IInput.get("KeyE")]))
				.text.add("\xa0 More information"))
			.append(Component.create("p")
				.classes.add(InventoryViewClasses.Hint)
				.append(Hint.create([IInput.get("KeyS", "Ctrl")]))
				.text.add("\xa0 Configure sort"))
			.append(Component.create("p")
				.classes.add(InventoryViewClasses.Hint)
				.append(Hint.create([IInput.get("KeyF", "Ctrl")]))
				.text.add("\xa0 Configure filter"));

		UiEventBus.subscribe("keydown", this.onGlobalKeydown);
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
			.tweak(itemSort => itemSort.button
				.classes.remove(ButtonClasses.Main)
				.classes.add(View.Classes.FooterButton)
				.innerIcon?.classes.add(View.Classes.FooterButtonIcon))
			.tweak(itemSort => itemSort.label.classes.add(View.Classes.FooterButtonLabel))
			.tweak(itemSort => itemSort.sortText.classes.add(View.Classes.FooterButtonText))
			.appendTo(this.super.footer);

		this.filterer = ItemFilter.getFor(this.super.definition.filter)
			.event.subscribe("filter", this.filter)
			.event.subscribe("submit", () =>
				document.querySelector<HTMLButtonElement>(`.${ItemClasses.Main}:not([tabindex="-1"])`)?.focus())
			.tweak(itemFilter => itemFilter.button
				.classes.remove(ButtonClasses.Main)
				.classes.add(View.Classes.FooterButton)
				.innerIcon?.classes.add(View.Classes.FooterButtonIcon))
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

		if (this.hintsDrawer.isOpen() && event.useOverInput("Escape")) {
			this.hintsDrawer.close(true);
		}

		if (this.filterer.isFiltered() && event.use("Escape")) {
			this.filterer.reset();
		}
	}

	protected onItemMoveStart (item: Item, event: Event & { mouse: IVector2 }) {

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

				// const bucketComponents = this.getBucket(item.bucket);

				// for (const bucketComponent of bucketComponents)
				// 	bucketComponent.classes.add(InventoryViewClasses.BucketMovingFrom);

				this.onItemMoveStart(item, event);
			},
			move: event => {
				// for (const [, dropBucket] of this.bucketEntries) {
				// 	if (dropBucket.is(InventoryBucketHashes.Consumables) || dropBucket.is(InventoryBucketHashes.Modifications) || dropBucket.isPostmaster())
				// 		continue;

				// 	const buckets = this.getBucket(dropBucket);
				// 	for (const bucket of buckets)
				// 		for (const { component } of bucket.getDropTargets())
				// 			component.classes.toggle(
				// 				component.intersects(event.mouse, true) && !component.element.matches(`.${Classes.Hidden} *`),
				// 				InventoryViewClasses.BucketDropTarget);
				// }
			},
			moveEnd: async event => {
				// const bucketComponents = this.getBucket(item.bucket);
				// for (const bucketComponent of bucketComponents)
				// 	bucketComponent.classes.remove(InventoryViewClasses.BucketMovingFrom);

				// let dropBucket: Bucket | undefined;
				// let dropEquipped = false;
				// for (const [, bucket] of this.bucketEntries) {
				// 	if (bucket.is(InventoryBucketHashes.Consumables) || bucket.is(InventoryBucketHashes.Modifications) || bucket.isPostmaster() || bucket.is(InventoryBucketHashes.Subclass))
				// 		continue;

				// 	const buckets = this.getBucket(bucket);
				// 	let intersections = false;
				// 	for (const bucket of buckets) {
				// 		for (const { component, equipped } of bucket.getDropTargets()) {
				// 			component.classes.remove(InventoryViewClasses.BucketDropTarget);
				// 			if (!intersections && !dropBucket && component.intersects(event.mouse, true) && !component.element.matches(`.${Classes.Hidden} *`)) {
				// 				intersections = true;
				// 				dropEquipped = equipped;
				// 			}
				// 		}
				// 	}

				// 	if (!intersections || dropBucket)
				// 		continue;

				// 	dropBucket = bucket;
				// }

				// if (!dropBucket)
				// 	return;

				// if (item.bucket === dropBucket && item.equipped === dropEquipped)
				// 	return;

				// if (dropBucket.isCharacter()) {
				// 	if (dropEquipped)
				// 		return item.equip(dropBucket.characterId!);
				// 	else if (item.equipped && item.bucket === dropBucket)
				// 		return item.unequip();
				// }

				// await item.transferToBucket(dropBucket);
			},
		}]);
	}
}

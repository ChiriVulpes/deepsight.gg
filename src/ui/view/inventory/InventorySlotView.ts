import { BucketHashes } from "bungie-api-ts/destiny2";
import type Model from "model/Model";
import type Character from "model/models/Characters";
import Inventory from "model/models/Inventory";
import type { Bucket } from "model/models/Items";
import type Item from "model/models/items/Item";
import type { BucketId, CharacterId, DestinationBucketId, OwnedBucketId } from "model/models/items/Item";
import { PostmasterId } from "model/models/items/Item";
import { Classes, InventoryClasses } from "ui/Classes";
import Component from "ui/Component";
import Button, { ButtonClasses } from "ui/form/Button";
import Drawer from "ui/form/Drawer";
import type BucketComponent from "ui/inventory/bucket/Bucket";
import CharacterBucket from "ui/inventory/bucket/CharacterBucket";
import PostmasterBucket from "ui/inventory/bucket/PostmasterBucket";
import VaultBucket from "ui/inventory/bucket/VaultBucket";
import DraggableItem from "ui/inventory/DraggableItemComponent";
import FilterManager from "ui/inventory/filter/FilterManager";
import ItemFilter from "ui/inventory/filter/ItemFilter";
import ItemComponent, { ItemClasses } from "ui/inventory/ItemComponent";
import ItemSort from "ui/inventory/sort/ItemSort";
import type SortManager from "ui/inventory/sort/SortManager";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import View from "ui/View";
import Arrays from "utility/Arrays";
import type { IVector2 } from "utility/maths/Vector2";
import Store from "utility/Store";

export enum InventorySlotViewClasses {
	Main = "view-inventory-slot",
	Content = "view-inventory-slot-content",
	Footer = "view-inventory-slot-footer",
	CharacterBuckets = "view-inventory-slot-character-buckets",
	VaultBuckets = "view-inventory-slot-vault-buckets",
	VaultBucketsCombined = "view-inventory-slot-vault-buckets-combined",
	PostmasterBuckets = "view-inventory-slot-postmaster-buckets",
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

export interface IInventorySlotViewDefinition {
	sort: SortManager;
	slot?: BucketHashes;
	filter: FilterManager;
	separateVaults?: true;
}

class InventorySlotViewWrapper extends View.WrapperComponent<[], [], View.IViewBase<[]> & IInventorySlotViewDefinition> { }

type InventorySlotViewArgs = [Inventory];
export class InventorySlotView extends Component.makeable<HTMLElement, InventorySlotViewArgs>().of(InventorySlotViewWrapper) {

	public static hasExisted = false;
	public static current?: InventorySlotView;

	public inventory!: Inventory;
	public currentCharacter!: CharacterBucket;
	public characterBucketsContainer!: Component;
	public vaultBucketsContainer!: Component;
	public postmasterBucketsContainer!: Component;
	public characters!: Partial<Record<BucketHashes, Record<CharacterId, CharacterBucket>>>;
	public postmasters!: Record<PostmasterId, PostmasterBucket>;
	public vaults!: Partial<Record<BucketHashes, Record<CharacterId, VaultBucket>>>;
	public bucketEntries!: [OwnedBucketId, Bucket][];
	public itemMap!: Map<Item, ItemComponent>;
	public hints!: Component;
	public hintsDrawer!: Drawer;
	public equipped!: Record<`${bigint}`, ItemComponent>;
	public sorter!: ItemSort;
	public filterer!: ItemFilter;

	protected override async onMake (inventory: Inventory) {
		InventorySlotView.hasExisted = true;
		InventorySlotView.current = this;
		this.inventory = inventory;
		inventory.setShouldSkipCharacters(() => !InventorySlotView.current);

		this.classes.add(InventorySlotViewClasses.Main);
		this.super.content.classes.add(InventorySlotViewClasses.Content);

		this.characterBucketsContainer = Component.create()
			.classes.add(InventorySlotViewClasses.CharacterBuckets)
			.appendTo(this.super.content);

		this.vaultBucketsContainer = Component.create()
			.classes.add(InventorySlotViewClasses.VaultBuckets)
			.appendTo(this.super.content);

		this.postmasterBucketsContainer = Component.create()
			.classes.add(InventorySlotViewClasses.PostmasterBuckets)
			.appendTo(this.super.content);

		this.equipped = {};
		this.itemMap = new Map<Item, ItemComponent>();

		this.update = this.update.bind(this);
		inventory.event.subscribe("update", this.update);
		this.event.subscribe("hide", () => {
			inventory.event.unsubscribe("update", this.update);
			if (InventorySlotView.current === this)
				delete InventorySlotView.current;
		});

		this.sort = this.sort.bind(this);
		this.filter = this.filter.bind(this);
		this.preUpdateInit();
		this.update();

		this.super.footer.classes.add(InventorySlotViewClasses.Footer);

		await FilterManager.init();
		this.initSortAndFilter();

		this.hints = Component.create()
			.classes.add(InventorySlotViewClasses.Hints)
			.event.subscribe("mouseenter", () => this.hintsDrawer.open("mouse"))
			.event.subscribe("mouseleave", () => this.hintsDrawer.close("mouse"))
			.appendTo(this.super.footer);

		Button.create()
			.classes.remove(ButtonClasses.Main)
			.classes.add(InventorySlotViewClasses.HintsButton, View.Classes.FooterButton)
			.addIcon(icon => icon.classes.add(InventorySlotViewClasses.HintIcon))
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
			.classes.add(InventorySlotViewClasses.HintsDrawer)
			.appendTo(this.hints);

		this.hintsDrawer.createPanel()
			.append(Component.create("p")
				.classes.add(InventorySlotViewClasses.Hint)
				.append(Component.create("kbd")
					.text.set("F1"))
				.text.add("\xa0 Player overview"))
			.append(Component.create("p")
				.classes.add(InventorySlotViewClasses.Hint)
				.classes.toggle(!!Store.items.settingsAlwaysShowExtra, Classes.Hidden)
				.append(Component.create("kbd")
					.text.set("E"))
				.text.add("\xa0 More information"))
			.append(Component.create("p")
				.classes.add(InventorySlotViewClasses.Hint)
				.append(Component.create("kbd")
					.text.set("Ctrl"))
				.append(Component.create("kbd")
					.text.set("S"))
				.text.add("\xa0 Configure sort"))
			.append(Component.create("p")
				.classes.add(InventorySlotViewClasses.Hint)
				.append(Component.create("kbd")
					.text.set("Ctrl"))
				.append(Component.create("kbd")
					.text.set("F"))
				.text.add("\xa0 Configure filter"));

		this.onGlobalKeydown = this.onGlobalKeydown.bind(this);
		UiEventBus.subscribe("keydown", this.onGlobalKeydown);
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

		this.filterer = ItemFilter.create([this.super.definition.filter])
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

	private update () {
		this.updateCharacters();
		this.updateItems();
		this.sort();
		this.filter();
	}

	private updateItems () {
		this.bucketEntries = Object.entries(this.inventory.buckets ?? {}) as [OwnedBucketId, Bucket][];
		for (const [item] of this.itemMap) {
			if (!this.bucketEntries.some(([, bucket]) => bucket.items.includes(item))) {
				// this item doesn't exist anymore
				this.itemMap.delete(item);
			}
		}

		for (const [bucketId, bucket] of this.bucketEntries) {
			if (bucketId === "inventory")
				continue;

			for (const item of bucket.items) {
				const excluded = !PostmasterId.is(item.bucket)
					&& (this.super.definition.slot !== undefined && item.definition.inventory?.bucketTypeHash !== this.super.definition.slot);

				if (this.itemMap.has(item)) {
					if (excluded)
						// this item was transferred from postmaster and should not be in this view
						this.itemMap.delete(item);

					// don't create a new item component if one already exists for this item
					continue;
				}

				if (excluded)
					continue;

				this.itemMap.set(item, this.createItemComponent(item));
			}
		}
	}

	protected updateCharacters () {
		this.characters ??= {};
		this.vaults ??= {};
		this.postmasters ??= {};

		const slot = this.super.definition.slot;
		if (!slot)
			return;

		const result = this.generateSortedBuckets(slot);
		if (result.changed) {
			this.characterBucketsContainer.append(...result.buckets.flatMap(({ character }) => character));
			this.vaultBucketsContainer.append(...result.buckets.flatMap(({ vault }) => vault));
			this.postmasterBucketsContainer.append(...result.buckets.flatMap(({ postmaster }) => postmaster));
		}
	}

	protected generateSortedPostmasters () {
		const oldPostmasterBuckets = Object.values(this.postmasters ?? {});

		const postmasters = (this.inventory.sortedCharacters ?? [])
			.map(character => this.generatePostmasterBucket(character));

		for (const oldPostmasterBucket of oldPostmasterBuckets)
			if (!postmasters.some(postmaster => oldPostmasterBucket === postmaster))
				// this character was deleted
				oldPostmasterBucket.remove();

		const charactersChanged = postmasters.length !== oldPostmasterBuckets.length
			|| oldPostmasterBuckets.some((bucket, i) => bucket.character.characterId !== postmasters[i]?.character?.characterId);

		return {
			changed: charactersChanged,
			postmasters,
			oldPostmasterBuckets,
		};
	}

	private generatePostmasterBucket (character: Character) {
		return this.postmasters[`postmaster:${character.characterId as CharacterId}`] ??= PostmasterBucket.create([]).setCharacter(character);
	}

	protected generateSortedBuckets (slot: BucketHashes) {
		const oldCharacterBuckets = Object.values(this.characters[slot] ?? {});
		const oldVaultBuckets = Object.values(this.vaults[slot] ?? {});

		const characters = this.characters[slot] ??= {};
		const vaults = this.vaults[slot] ??= {};

		const singleVaultBucket = this.super.definition.separateVaults ? undefined : VaultBucket.create([]);
		this.vaultBucketsContainer.classes.toggle(!this.super.definition.separateVaults, InventorySlotViewClasses.VaultBucketsCombined);

		const { oldPostmasterBuckets } = this.generateSortedPostmasters();

		const characterBucketsSorted = (this.inventory.sortedCharacters ?? [])
			.map(character => ({
				character: characters[character.characterId as CharacterId] ??= CharacterBucket.create([]).setCharacter(character),
				postmaster: this.generatePostmasterBucket(character),
				vault: vaults[character.characterId as CharacterId] ??= singleVaultBucket ?? VaultBucket.create([character]),
			}));

		for (const oldCharacterBucket of oldCharacterBuckets)
			if (!characterBucketsSorted.some(({ character }) => oldCharacterBucket === character))
				// this character was deleted
				oldCharacterBucket.remove();

		for (const oldVaultBucket of oldVaultBuckets)
			if (!characterBucketsSorted.some(({ vault }) => oldVaultBucket === vault))
				// this character was deleted
				oldVaultBucket.remove();

		this.currentCharacter = characterBucketsSorted[0]?.character;

		const charactersChanged = characterBucketsSorted.length !== oldCharacterBuckets.length
			|| oldCharacterBuckets.some((bucket, i) => bucket.character.characterId !== characterBucketsSorted[i]?.character.character?.characterId);

		return {
			current: characterBucketsSorted[0]?.character,
			changed: charactersChanged,
			buckets: characterBucketsSorted,
			oldCharacterBuckets,
			oldPostmasterBuckets,
			oldVaultBuckets,
		};
	}

	protected sort () {
		if (this.super.definition.slot)
			this.sortSlot(this.super.definition.slot);

		for (const postmaster of Object.values(this.postmasters))
			postmaster.update();
	}

	protected sortSlot (slot: BucketHashes) {
		const highestPowerSlot: Component[] = [];
		let highestPower = 0;
		for (const [bucketId, bucket] of this.bucketEntries) {
			if (bucketId === "inventory")
				continue;

			let bucketComponents: BucketComponent[];
			let equippedComponent: Component | undefined;
			if (bucketId === "vault")
				bucketComponents = Object.values(this.vaults[slot] ?? {});

			else if (PostmasterId.is(bucketId)) {
				const postmasterBucket = this.postmasters[bucketId];
				if (!postmasterBucket) {
					console.warn(`Unknown postmaster character '${bucketId}'`);
					continue;
				}

				bucketComponents = [this.postmasters[bucketId]];

			} else {
				const characterBucket = this.characters[slot]?.[bucketId];
				if (!characterBucket) {
					console.warn(`Unknown character '${bucketId}'`);
					continue;
				}

				bucketComponents = [characterBucket];
				equippedComponent = characterBucket.equippedSlot;

				const currentlyEquipped = this.equipped[bucketId];
				if (!this.itemMap.has(currentlyEquipped?.item))
					// old item instance was equipped here, remove it
					currentlyEquipped?.remove();
			}

			equippedComponent?.classes.remove(InventorySlotViewClasses.HighestPower);

			if (!bucketComponents.length)
				continue;

			const slots = bucketComponents.flatMap(component => [
				...component.content.children(),
				...component instanceof PostmasterBucket ? component.engrams.children() : [],
			]);
			for (const slot of slots)
				slot.classes.add(InventorySlotViewClasses.SlotPendingRemoval);

			for (const item of this.super.definition.sort.sort(bucket.items)) {
				if (item.definition.inventory?.bucketTypeHash !== slot && !PostmasterId.is(item.bucket))
					// item excluded from view
					continue;

				const itemComponent = this.itemMap.get(item);

				if (!itemComponent)
					// item not included in view
					continue;

				const bucketComponent = bucketComponents.length === 1 ? bucketComponents[0]
					: bucketComponents.find(component => (component as VaultBucket).character?.classType === item.definition.classType)
					?? bucketComponents[0];

				const slotWrapper = item.reference.bucketHash === BucketHashes.Engrams ? (bucketComponent as PostmasterBucket).engrams
					: bucketComponent.content;
				const slotComponent = item.equipped ? equippedComponent! : Component.create()
					.classes.add(InventoryClasses.Slot)
					.appendTo(slotWrapper);

				itemComponent
					.setSortedBy(this.super.definition.sort)
					.appendTo(slotComponent);

				if (item.equipped)
					this.equipped[bucketId as `${bigint}`] = itemComponent;

				if (!PostmasterId.is(item.bucket)) {
					const power = item.getPower();
					if (power > highestPower) {
						highestPower = power;
						highestPowerSlot.splice(0, Infinity, slotComponent);
					} else if (power === highestPower) {
						highestPowerSlot.push(slotComponent);
					}
				}
			}

			// clean up old slots
			for (const slot of slots)
				if (slot.classes.has(InventorySlotViewClasses.SlotPendingRemoval))
					slot.remove();
		}

		if (highestPowerSlot.length < 3)
			for (const slot of highestPowerSlot)
				slot.classes.add(InventorySlotViewClasses.HighestPower);
	}

	private filter () {
		for (const [item, component] of this.itemMap) {
			const filteredOut = !this.super.definition.filter.apply(item);
			component.classes.toggle(filteredOut, InventorySlotViewClasses.ItemFilteredOut)
				.attributes.toggle(filteredOut, "tabindex", "-1");
		}
	}

	private getBucket (bucketId: BucketId) {
		return bucketId === "vault" ? Object.values(this.vaults ?? {}).flatMap(vaults => Object.values(vaults))
			: bucketId === "inventory" ? [this.currentCharacter]
				: PostmasterId.is(bucketId) ? [this.postmasters[bucketId]]
					: bucketId === "collections" ? []
						: Object.values(this.characters).map(character => character[bucketId]).filter(Arrays.filterNullish);
	}

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
	private createItemComponent (item: Item) {
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

				if (item.equipped)
					return event.preventDefault();

				const bucketComponents = this.getBucket(item.bucket);

				for (const bucketComponent of bucketComponents)
					bucketComponent.classes.add(InventorySlotViewClasses.BucketMovingFrom);

				this.onItemMoveStart(item, event);
			},
			move: event => {
				for (const [dropBucketId] of this.bucketEntries) {
					if (dropBucketId === "inventory" || PostmasterId.is(dropBucketId))
						continue;

					const components = this.getBucket(dropBucketId);
					for (const component of components)
						component.classes.toggle(component.intersects(event.mouse, true) && !component.element.matches(`.${Classes.Hidden} *`), InventorySlotViewClasses.BucketDropTarget);
				}
			},
			moveEnd: async event => {
				const bucketComponents = this.getBucket(item.bucket);
				for (const bucketComponent of bucketComponents)
					bucketComponent.classes.remove(InventorySlotViewClasses.BucketMovingFrom);

				let dropBucketId: DestinationBucketId | undefined;
				for (const [bucketId] of this.bucketEntries) {
					if (bucketId === "inventory" || PostmasterId.is(bucketId))
						continue;

					const components = this.getBucket(bucketId);
					let intersections = false;
					for (const component of components) {
						component.classes.remove(InventorySlotViewClasses.BucketDropTarget);
						if (component.intersects(event.mouse, true) && !component.element.matches(`.${Classes.Hidden} *`))
							intersections = true;
					}

					if (!intersections)
						continue;

					dropBucketId = bucketId;
				}

				if (dropBucketId)
					// update this item component's bucket so future clicks transfer to the right place
					await item.transferToBucket(dropBucketId);
			},
		}]);
	}
}


export default new View.Factory()
	.using(Inventory.createTemporary())
	.define<IInventorySlotViewDefinition>()
	.initialise((view, model) =>
		view.make(InventorySlotView, model))
	.wrapper<InventorySlotView & View.WrapperComponent<[Model<Inventory>], [], IInventorySlotViewDefinition & View.IViewBase<[]>>>();

import { BucketHashes } from "bungie-api-ts/destiny2";
import type Character from "model/models/Characters";
import type Inventory from "model/models/Inventory";
import type { Bucket } from "model/models/Items";
import type Item from "model/models/items/Item";
import type { BucketId, DestinationBucketId, OwnedBucketId } from "model/models/items/Item";
import { CharacterId, PostmasterId } from "model/models/items/Item";
import { TierIndex } from "model/models/items/Tier";
import { Classes } from "ui/Classes";
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
import Slot from "ui/inventory/Slot";
import ItemSort from "ui/inventory/sort/ItemSort";
import type SortManager from "ui/inventory/sort/SortManager";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import View from "ui/View";
import Arrays from "utility/Arrays";
import type { IVector2 } from "utility/maths/Vector2";
import Store from "utility/Store";

export enum InventoryViewClasses {
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

export interface IInventoryViewDefinition {
	sort: SortManager;
	slot?: Arrays.Or<Arrays.Or<BucketHashes>>;
	filter: FilterManager;
	separateVaults?: true;
}

export namespace IInventoryViewDefinition {
	export function resolveSlotId (slot: Arrays.Or<BucketHashes>) {
		return Array.isArray(slot) ? slot.join(",") : slot;
	}

	export function resolveSlotIds (slot?: IInventoryViewDefinition["slot"]) {
		return Arrays.resolve(slot).map(slot => Array.isArray(slot) ? slot.join(",") : slot);
	}

	const handledBuckets = new Set([
		BucketHashes.KineticWeapons, BucketHashes.EnergyWeapons, BucketHashes.PowerWeapons,
		BucketHashes.Helmet, BucketHashes.Gauntlets, BucketHashes.ChestArmor, BucketHashes.LegArmor, BucketHashes.ClassArmor,
		BucketHashes.LostItems, BucketHashes.Engrams,
		BucketHashes.Consumables,
		BucketHashes.Ghost, BucketHashes.Vehicle, BucketHashes.Ships,
	]);
	export function isLeftoverModificationsVaultItem (item: Item) {
		return item.bucket === "vault"
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
	public currentCharacter!: CharacterBucket;
	public characterBucketsContainer!: Component;
	public vaultBucketsContainer!: Component;
	public postmasterBucketsContainer!: Component;
	public consumablesBucket?: BucketComponent;
	public modificationsBucket?: BucketComponent;
	public characters!: Partial<Record<BucketHashes | string, Record<CharacterId, CharacterBucket>>>;
	public postmasters!: Record<PostmasterId, PostmasterBucket>;
	public vaults!: Partial<Record<BucketHashes | string, Record<CharacterId, VaultBucket>>>;
	public bucketEntries!: [OwnedBucketId, Bucket][];
	public itemMap!: Map<Item, ItemComponent>;
	public hints!: Component;
	public hintsDrawer!: Drawer;
	public equipped!: Record<`${bigint}`, ItemComponent>;
	public sorter!: ItemSort;
	public filterer!: ItemFilter;

	protected override async onMake (inventory: Inventory) {
		InventoryView.hasExisted = true;
		InventoryView.current = this;
		this.inventory = inventory;
		inventory.setShouldSkipCharacters(() => !InventoryView.current);

		this.classes.add(InventoryViewClasses.Main);
		this.super.content.classes.add(InventoryViewClasses.Content);

		if (!this.inventory.sortedCharacters?.length) {
			this.super.setTitle(title => title.text.set("No Guardians Found..."));
			this.super.setSubtitle("small", subtitle => subtitle.text.set("Your ghost continues its search..."));
			return;
		}

		this.characterBucketsContainer = Component.create()
			.classes.add(InventoryViewClasses.CharacterBuckets)
			.appendTo(this.super.content);

		this.vaultBucketsContainer = Component.create()
			.classes.add(InventoryViewClasses.VaultBuckets)
			.appendTo(this.super.content);

		this.postmasterBucketsContainer = Component.create()
			.classes.add(InventoryViewClasses.PostmasterBuckets)
			.appendTo(this.super.content);

		this.equipped = {};
		this.itemMap = new Map<Item, ItemComponent>();

		this.update = this.update.bind(this);
		inventory.event.subscribe("update", this.update);
		this.event.subscribe("hide", () => {
			inventory.event.unsubscribe("update", this.update);
			if (InventoryView.current === this)
				delete InventoryView.current;
		});

		this.sort = this.sort.bind(this);
		this.filter = this.filter.bind(this);
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
				.append(Component.create("kbd")
					.text.set("F1"))
				.text.add("\xa0 Player overview"))
			.append(Component.create("p")
				.classes.add(InventoryViewClasses.Hint)
				.classes.toggle(!!Store.items.settingsAlwaysShowExtra, Classes.Hidden)
				.append(Component.create("kbd")
					.text.set("E"))
				.text.add("\xa0 More information"))
			.append(Component.create("p")
				.classes.add(InventoryViewClasses.Hint)
				.append(Component.create("kbd")
					.text.set("Ctrl"))
				.append(Component.create("kbd")
					.text.set("S"))
				.text.add("\xa0 Configure sort"))
			.append(Component.create("p")
				.classes.add(InventoryViewClasses.Hint)
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
			this.updateBucketItems(bucketId, bucket);
		}
	}

	protected updateBucketItems (bucketId: OwnedBucketId, bucket: Bucket) {
		for (const item of bucket.items) {
			const excluded = !PostmasterId.is(item.bucket)
				&& this.super.definition.slot !== undefined
				// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
				&& !Arrays.resolve(this.super.definition.slot).includes(item.definition.inventory?.bucketTypeHash!)
				&& !(bucketId === "vault" && item.bucket === "vault");

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

	protected updateCharacters () {
		this.characters ??= {};
		this.vaults ??= {};
		this.postmasters ??= {};

		const slots = this.super.definition.slot;
		if (!slots)
			return;

		for (const slot of Arrays.resolve(slots)) {
			const result = this.generateSortedBuckets(slot);
			if (result.changed) {
				this.characterBucketsContainer.append(...result.buckets.flatMap(({ character }) => character));
				this.vaultBucketsContainer.append(...result.buckets.flatMap(({ vault }) => vault));
				this.postmasterBucketsContainer.append(...result.buckets.flatMap(({ postmaster }) => postmaster));
			}
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

	protected generateSortedBuckets (slot: Arrays.Or<BucketHashes>, separateVaults: boolean | undefined = this.super.definition.separateVaults, skipPostmasters = false) {
		const id = IInventoryViewDefinition.resolveSlotId(slot);

		const oldCharacterBuckets = Object.values(this.characters[id] ?? {});
		const oldVaultBuckets = Object.values(this.vaults[id] ?? {});

		const characters = this.characters[id] ??= {};
		const vaults = this.vaults[id] ??= {};

		const singleVaultBucket = separateVaults ? undefined : VaultBucket.create([]);
		this.vaultBucketsContainer.classes.toggle(!this.super.definition.separateVaults, InventoryViewClasses.VaultBucketsCombined);

		const { oldPostmasterBuckets } = skipPostmasters ? { oldPostmasterBuckets: undefined } : this.generateSortedPostmasters();

		const characterBucketsSorted = (this.inventory.sortedCharacters ?? [])
			.map(character => ({
				character: characters[character.characterId as CharacterId] ??= CharacterBucket.create([]).setCharacter(character),
				postmaster: skipPostmasters ? undefined : this.generatePostmasterBucket(character),
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
		for (const slot of Arrays.resolve(this.super.definition.slot)) {
			const id = IInventoryViewDefinition.resolveSlotId(slot);
			this.sortSlot(slot);

			for (const character of Object.values(this.characters[id] ?? {}))
				character.update();

			for (const vault of Object.values(this.vaults[id] ?? {}))
				vault.update(this.inventory);
		}

		for (const postmaster of Object.values(this.postmasters))
			postmaster.update();
	}

	protected sortSlot (slot: Arrays.Or<BucketHashes>) {
		const id = IInventoryViewDefinition.resolveSlotId(slot);
		const highestPowerSlot: Component[] = [];
		let highestPower = 0;
		const sortedBucketItems: Partial<Record<OwnedBucketId, Item[]>> = {};
		for (const [bucketId, bucket] of this.bucketEntries) {
			let bucketComponents: BucketComponent[];
			let equippedComponent: Component | undefined;
			if (bucketId === "modifications") {
				if (!this.modificationsBucket || slot !== BucketHashes.Modifications)
					continue;

				bucketComponents = [this.modificationsBucket];

			} else if (bucketId === "consumables") {
				if (!this.consumablesBucket || slot !== BucketHashes.Consumables)
					continue;

				bucketComponents = [this.consumablesBucket];

			} else if (bucketId === "vault")
				bucketComponents = Object.values(this.vaults[id] ?? {});

			else if (PostmasterId.is(bucketId)) {
				const postmasterBucket = this.postmasters[bucketId];
				if (!postmasterBucket) {
					console.warn(`Unknown postmaster character '${bucketId}'`);
					continue;
				}

				bucketComponents = [this.postmasters[bucketId]];

			} else {
				const characterBucket = this.characters[id]?.[bucketId];
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

			equippedComponent?.classes.remove(InventoryViewClasses.HighestPower);

			if (!bucketComponents.length)
				continue;

			const slots = bucketComponents.flatMap(component => [
				...component.content.children(),
				...component instanceof PostmasterBucket ? component.engrams.children() : [],
			]);
			for (const slot of slots)
				slot.classes.add(InventoryViewClasses.SlotPendingRemoval);

			const sortedItems = sortedBucketItems[bucketId] = this.super.definition.sort.sort(bucket.items)
				.filter(item => !(item.definition.inventory?.bucketTypeHash !== slot && !PostmasterId.is(item.bucket) && !(bucketId === "vault" && slot === BucketHashes.Modifications && IInventoryViewDefinition.isLeftoverModificationsVaultItem(item)) && this.itemMap.get(item)));
			for (const item of sortedItems) {
				const itemComponent = this.itemMap.get(item);
				if (!itemComponent)
					// item not included in view
					continue;

				const bucketComponent = bucketComponents.length === 1 ? bucketComponents[0]
					: bucketComponents.find(component => (component as VaultBucket).character?.classType === item.definition.classType)
					?? bucketComponents[0];

				const slotWrapper = item.reference.bucketHash === BucketHashes.Engrams ? (bucketComponent as PostmasterBucket).engrams
					: bucketComponent.content;
				const slotComponent = item.equipped ? equippedComponent! : Slot.create()
					.appendTo(slotWrapper);

				itemComponent
					.setSortedBy(this.super.definition.sort)
					.appendTo(slotComponent);

				if (item.equipped)
					this.equipped[bucketId as `${bigint}`] = itemComponent;

				if (!PostmasterId.is(item.bucket)) {
					const power = item.getPower();
					// eslint-disable-next-line no-empty
					if (!power) {
					} else if (power > highestPower) {
						highestPower = power;
						highestPowerSlot.splice(0, Infinity, slotComponent);
					} else if (power === highestPower) {
						highestPowerSlot.push(slotComponent);
					}
				}
			}

			// clean up old slots
			for (const slot of slots)
				if (slot.classes.has(InventoryViewClasses.SlotPendingRemoval))
					slot.remove();
		}

		if (highestPowerSlot.length < 3)
			for (const slot of highestPowerSlot)
				slot.classes.add(InventoryViewClasses.HighestPower);

		for (const equipped of Object.values(this.equipped)) {
			equipped.item.fallbackItem = sortedBucketItems[equipped.item.character!]?.find(item => (item.tier?.index ?? 0) <= (equipped.item.tier?.index ?? TierIndex.Legendary) && item !== equipped.item)
				?? sortedBucketItems.vault?.find(item => (item.tier?.index ?? 0) <= (equipped.item.tier?.index ?? TierIndex.Legendary));
		}
	}

	private filter () {
		for (const [item, component] of this.itemMap) {
			const filteredOut = !this.super.definition.filter.apply(item);
			component.classes.toggle(filteredOut, InventoryViewClasses.ItemFilteredOut)
				.attributes.toggle(filteredOut, "tabindex", "-1");
		}
	}

	private getBucket (bucketId: BucketId) {
		return bucketId === "vault" ? Object.values(this.vaults ?? {}).flatMap(vaults => Object.values(vaults ?? {}))
			: bucketId === "consumables" || bucketId === "modifications" ? [this.currentCharacter]
				: PostmasterId.is(bucketId) ? [this.postmasters[bucketId]]
					: bucketId === "collections" ? []
						: Object.values(this.characters).map(character => character?.[bucketId]).filter(Arrays.filterNullish);
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

				if (item.equipped)
					return event.preventDefault();

				const bucketComponents = this.getBucket(item.bucket);

				for (const bucketComponent of bucketComponents)
					bucketComponent.classes.add(InventoryViewClasses.BucketMovingFrom);

				this.onItemMoveStart(item, event);
			},
			move: event => {
				for (const [dropBucketId] of this.bucketEntries) {
					if (dropBucketId === "consumables" || dropBucketId === "modifications" || PostmasterId.is(dropBucketId))
						continue;

					const buckets = this.getBucket(dropBucketId);
					for (const bucket of buckets)
						for (const { component } of bucket.getDropTargets())
							component.classes.toggle(
								component.intersects(event.mouse, true) && !component.element.matches(`.${Classes.Hidden} *`),
								InventoryViewClasses.BucketDropTarget);
				}
			},
			moveEnd: async event => {
				const bucketComponents = this.getBucket(item.bucket);
				for (const bucketComponent of bucketComponents)
					bucketComponent.classes.remove(InventoryViewClasses.BucketMovingFrom);

				let dropBucketId: DestinationBucketId | undefined;
				let dropEquipped = false;
				for (const [bucketId] of this.bucketEntries) {
					if (bucketId === "consumables" || bucketId === "modifications" || PostmasterId.is(bucketId))
						continue;

					const buckets = this.getBucket(bucketId);
					let intersections = false;
					for (const bucket of buckets) {
						for (const { component, equipped } of bucket.getDropTargets()) {

							component.classes.remove(InventoryViewClasses.BucketDropTarget);
							if (component.intersects(event.mouse, true) && !component.element.matches(`.${Classes.Hidden} *`)) {
								intersections = true;
								dropEquipped = equipped;
							}
						}
					}

					if (!intersections)
						continue;

					dropBucketId = bucketId;
				}

				if (!dropBucketId)
					return;

				// update this item component's bucket so future clicks transfer to the right place
				if (dropEquipped && CharacterId.is(dropBucketId))
					await item.equip(dropBucketId);
				else
					await item.transferToBucket(dropBucketId);
			},
		}]);
	}
}

import type { DestinyCharacterComponent, DictionaryComponentResponse, ItemCategoryHashes } from "bungie-api-ts/destiny2";
import { BucketHashes, DestinyComponentType } from "bungie-api-ts/destiny2";
import type { IModelGenerationApi } from "model/Model";
import Model from "model/Model";
import type { Bucket } from "model/models/Items";
import Items from "model/models/Items";
import type Item from "model/models/items/Item";
import type { BucketId, CharacterId, DestinationBucketId, ItemId } from "model/models/items/Item";
import { PostmasterId } from "model/models/items/Item";
import Profile from "model/models/Profile";
import { Classes, InventoryClasses } from "ui/Classes";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import FocusManager from "ui/FocusManager";
import { ButtonClasses } from "ui/form/Button";
import type { IDraggableEvents } from "ui/form/Draggable";
import Draggable from "ui/form/Draggable";
import BucketComponent from "ui/inventory/Bucket";
import FilterManager from "ui/inventory/filter/FilterManager";
import ItemFilter from "ui/inventory/filter/ItemFilter";
import ItemComponent, { ItemClasses } from "ui/inventory/Item";
import ItemSort from "ui/inventory/sort/ItemSort";
import type SortManager from "ui/inventory/sort/SortManager";
import LoadingManager from "ui/LoadingManager";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import View from "ui/View";
import Arrays from "utility/Arrays";
import { EventManager } from "utility/EventManager";
import Time from "utility/Time";

export enum InventorySlotViewClasses {
	Main = "view-inventory-slot",
	Content = "view-inventory-slot-content",
	Footer = "view-inventory-slot-footer",
	CharacterBuckets = "view-inventory-slot-character-buckets",
	CharacterBucket = "view-inventory-slot-character-bucket",
	CharacterBucketEmblem = "view-inventory-slot-character-bucket-emblem",
	CharacterBucketEquipped = "view-inventory-slot-character-bucket-equipped",
	CharacterBucketInventory = "view-inventory-slot-character-bucket-inventory",
	VaultBucket = "view-inventory-slot-vault-bucket",
	PostmasterBuckets = "view-inventory-slot-postmaster-buckets",
	PostmasterBucket = "view-inventory-slot-postmaster-bucket",
	PostmasterBucketEngrams = "view-inventory-slot-postmaster-bucket-engrams",
	PostmasterBucketWarning = "view-inventory-slot-postmaster-bucket-warning",
	PostmasterBucketEmptySlot = "view-inventory-slot-postmaster-bucket-empty-slot",
	SlotPendingRemoval = "view-inventory-slot-pending-removal",
	HighestPower = "view-inventory-slot-highest-power",
	ItemMoving = "view-inventory-slot-item-moving",
	ItemMovingOriginal = "view-inventory-slot-item-moving-original",
	BucketDropTarget = "view-inventory-slot-bucket-drop-target",
	BucketMovingFrom = "view-inventory-slot-bucket-moving-from",
	Hints = "view-inventory-slot-hints",
	ItemFilteredOut = "view-inventory-slot-item-filtered-out",
}

class CharacterBucket extends BucketComponent<[]> {

	public character!: DestinyCharacterComponent;
	public equippedSlot!: Component;

	protected override onMake (): void {
		super.onMake();
		this.classes.add(InventorySlotViewClasses.CharacterBucket);

		Component.create()
			.classes.add(InventorySlotViewClasses.CharacterBucketEmblem, InventoryClasses.Slot)
			.appendTo(this.header);

		this.equippedSlot = Component.create()
			.classes.add(InventorySlotViewClasses.CharacterBucketEquipped, InventoryClasses.Slot)
			.appendTo(this);

		this.content.classes.add(InventorySlotViewClasses.CharacterBucketInventory);
	}

	public setCharacter (character: DestinyCharacterComponent) {
		this.character = character;
		void this.initialiseFromCharacter(character);
		return this;
	}
}

class PostmasterBucket extends BucketComponent<[]> {

	public character!: DestinyCharacterComponent;
	public engrams!: Component;

	protected override onMake (): void {
		super.onMake();
		this.classes.add(InventorySlotViewClasses.PostmasterBucket);

		this.engrams = Component.create()
			.classes.add(InventorySlotViewClasses.PostmasterBucketEngrams);

		this.element.insertBefore(this.engrams.element, this.content.element);

		this.icon.style.set("--icon", "url(\"/image/svg/postmaster.svg\")");
		this.title.text.add("Postmaster");
	}

	public setCharacter (character: DestinyCharacterComponent) {
		this.character = character;
		return this;
	}
}

interface IInteractableItemEvents extends ComponentEvents<typeof ItemComponent>, IDraggableEvents {
	transfer: Event;
}

class DraggableItem extends ItemComponent {

	public override readonly event!: ComponentEventManager<this, IInteractableItemEvents>;

	protected override async onMake (item: Item) {
		await super.onMake(item);
		new Draggable(this.element);
	}
}

interface IInventorySlotViewDefinition {
	sort: SortManager;
	slot: ItemCategoryHashes;
	filter: FilterManager;
}

class InventorySlotViewWrapper extends View.WrapperComponent<[], View.IViewBase & IInventorySlotViewDefinition> { }

type InventorySlotViewArgs = [Required<SlotViewModel>];
class InventorySlotView extends Component.makeable<HTMLElement, InventorySlotViewArgs>().of(InventorySlotViewWrapper) {

	public static hasExisted = false;
	public static current?: InventorySlotView;

	public model!: Required<SlotViewModel>;
	public vaultBucket!: BucketComponent;
	public currentCharacter!: CharacterBucket;
	public characterBucketsContainer!: Component;
	public postmasterBucketsContainer!: Component;
	public characters!: Record<CharacterId, CharacterBucket>;
	public postmasters!: Record<PostmasterId, PostmasterBucket>;
	public bucketEntries!: [BucketId, Bucket][];
	public itemMap!: Map<Item, ItemComponent>;
	public hints!: Component;
	public equipped!: Record<`${bigint}`, ItemComponent>;
	public filterer!: ItemFilter;

	protected override async onMake (model: Required<SlotViewModel>) {
		InventorySlotView.hasExisted = true;
		InventorySlotView.current = this;
		this.model = model;

		this.classes.add(InventorySlotViewClasses.Main);
		this.super.content.classes.add(InventorySlotViewClasses.Content);

		this.characterBucketsContainer = Component.create()
			.classes.add(InventorySlotViewClasses.CharacterBuckets)
			.appendTo(this.super.content);

		this.vaultBucket = BucketComponent.create()
			.classes.add(InventorySlotViewClasses.VaultBucket)
			.tweak(vault => vault.icon.style.set("--icon",
				"url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/vault2.svg\")"))
			.tweak(vault => vault.title.text.add("Vault"))
			.appendTo(this.super.content);

		this.postmasterBucketsContainer = Component.create()
			.classes.add(InventorySlotViewClasses.PostmasterBuckets)
			.appendTo(this.super.content);

		this.equipped = {};
		this.itemMap = new Map<Item, ItemComponent>();

		this.update = this.update.bind(this);
		model.event.subscribe("update", this.update);
		this.event.subscribe("hide", () => {
			model.event.unsubscribe("update", this.update);
			if (InventorySlotView.current === this)
				delete InventorySlotView.current;
		});

		this.sort = this.sort.bind(this);
		this.filter = this.filter.bind(this);
		this.update();

		this.super.footer.classes.add(InventorySlotViewClasses.Footer);

		ItemSort.create([this.super.definition.sort])
			.event.subscribe("sort", this.sort)
			.tweak(itemSort => itemSort.button
				.classes.remove(ButtonClasses.Main)
				.classes.add(View.Classes.FooterButton)
				.innerIcon?.classes.add(View.Classes.FooterButtonIcon))
			.tweak(itemSort => itemSort.label.classes.add(View.Classes.FooterButtonLabel))
			.tweak(itemSort => itemSort.sortText.classes.add(View.Classes.FooterButtonText))
			.appendTo(this.super.footer);

		await FilterManager.init();
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

		this.hints = Component.create()
			.classes.add(InventorySlotViewClasses.Hints)
			.appendTo(this.super.footer);

		this.onGlobalKeydown = this.onGlobalKeydown.bind(this);
		UiEventBus.subscribe("keydown", this.onGlobalKeydown);
	}

	private update () {
		this.updateCharacters();
		this.updateItems();
		this.sort();
		this.filter();
	}

	private updateItems () {
		this.bucketEntries = Object.entries(this.model.buckets) as [BucketId, Bucket][];
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
				const categories = item.definition.itemCategoryHashes ?? [];
				const excluded = !categories.includes(this.super.definition.slot) && !PostmasterId.is(item.bucket);

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

	private updateCharacters () {
		this.characters ??= {};
		this.postmasters ??= {};

		const characterBucketsSorted = Object.values(this.model.characters.data ?? {})
			.sort(({ dateLastPlayed: dateLastPlayedA }, { dateLastPlayed: dateLastPlayedB }) =>
				new Date(dateLastPlayedB).getTime() - new Date(dateLastPlayedA).getTime())
			.map(character => ({
				character: this.characters[character.characterId as CharacterId] ??= CharacterBucket.create([]).setCharacter(character),
				postmaster: this.postmasters[`postmaster:${character.characterId as CharacterId}`] ??= PostmasterBucket.create([]).setCharacter(character),
			}));

		const oldCharacterBuckets = [...this.characterBucketsContainer.children<CharacterBucket>()];
		for (const oldCharacterBucket of oldCharacterBuckets)
			if (!characterBucketsSorted.some(({ character }) => oldCharacterBucket === character))
				// this character was deleted
				oldCharacterBucket.remove();

		const oldPostmasterBuckets = [...this.postmasterBucketsContainer.children<PostmasterBucket>()];
		for (const oldPostmasterBucket of oldPostmasterBuckets)
			if (!characterBucketsSorted.some(({ postmaster }) => oldPostmasterBucket === postmaster))
				// this character was deleted
				oldPostmasterBucket.remove();

		this.currentCharacter = characterBucketsSorted[0].character;

		const charactersChanged = characterBucketsSorted.length !== oldCharacterBuckets.length
			|| oldCharacterBuckets.some((bucket, i) => bucket.character.characterId !== characterBucketsSorted[i]?.character.character?.characterId);
		if (charactersChanged) {
			this.characterBucketsContainer.append(...characterBucketsSorted.map(({ character }) => character));
			this.postmasterBucketsContainer.append(...characterBucketsSorted.map(({ postmaster }) => postmaster));
		}
	}

	private sort () {
		const highestPowerSlot: Component[] = [];
		let highestPower = 0;
		for (const [bucketId, bucket] of this.bucketEntries) {
			if (bucketId === "inventory")
				continue;

			let bucketComponent: BucketComponent;
			let equippedComponent: Component | undefined;
			if (bucketId === "vault")
				bucketComponent = this.vaultBucket;
			else if (PostmasterId.is(bucketId))
				bucketComponent = this.postmasters[bucketId];
			else {
				const characterBucket = this.characters[bucketId];
				if (!characterBucket) {
					console.warn(`Unknown character '${bucketId}'`);
					continue;
				}

				bucketComponent = characterBucket;
				equippedComponent = characterBucket.equippedSlot;

				const currentlyEquipped = this.equipped[bucketId];
				if (!this.itemMap.has(currentlyEquipped?.item))
					// old item instance was equipped here, remove it
					currentlyEquipped?.remove();
			}

			equippedComponent?.classes.remove(InventorySlotViewClasses.HighestPower);

			const slots = [
				...bucketComponent.content.children(),
				...bucketComponent instanceof PostmasterBucket ? bucketComponent.engrams.children() : [],
			];
			for (const slot of slots)
				slot.classes.add(InventorySlotViewClasses.SlotPendingRemoval);

			for (const item of this.super.definition.sort.sort(bucket.items)) {
				const itemComponent = this.itemMap.get(item);
				// if (!item.equipped && itemComponent?.parent() && !itemComponent.parent()!.classes.has(InventorySlotViewClasses.SlotPendingRemoval))
				// 	itemComponent = this.transferringItemMap.get(item);

				if (!itemComponent)
					// item not included in view
					continue;

				const slotWrapper = item.reference.bucketHash === BucketHashes.Engrams ? (bucketComponent as PostmasterBucket).engrams
					: bucketComponent.content;
				const slot = item.equipped ? equippedComponent! : Component.create()
					.classes.add(InventoryClasses.Slot)
					.appendTo(slotWrapper);

				itemComponent
					.setSortedBy(this.super.definition.sort)
					.appendTo(slot);

				if (item.equipped)
					this.equipped[bucketId as `${bigint}`] = itemComponent;

				const power = item.getPower();
				if (power > highestPower) {
					highestPower = power;
					highestPowerSlot.splice(0, Infinity, slot);
				} else if (power === highestPower) {
					highestPowerSlot.push(slot);
				}
			}

			// clean up old slots
			for (const slot of slots)
				if (slot.classes.has(InventorySlotViewClasses.SlotPendingRemoval))
					slot.remove();
		}

		// for (const [item, newComponent] of [...this.transferringItemMap]) {
		// 	const existing = this.itemMap.get(item);
		// 	if (document.contains(newComponent.element) && !document.contains(existing?.element ?? null)) {
		// 		this.itemMap.set(item, newComponent);
		// 		this.transferringItemMap.delete(item);
		// 	}
		// }

		if (highestPowerSlot.length < 3)
			for (const slot of highestPowerSlot)
				slot.classes.add(InventorySlotViewClasses.HighestPower);

		for (const postmaster of Object.values(this.postmasters)) {
			const postmasterItems = postmaster.content.element.childElementCount;
			const engrams = postmaster.engrams.element.childElementCount;
			postmaster
				.classes.toggle(!postmasterItems && !engrams, Classes.Hidden)
				.classes.toggle(postmasterItems > 15, InventorySlotViewClasses.PostmasterBucketWarning);

			if (postmasterItems)
				for (let i = postmasterItems; i < 21; i++)
					Component.create()
						.classes.add(InventoryClasses.Slot, InventorySlotViewClasses.PostmasterBucketEmptySlot)
						.appendTo(postmaster.content);

			if (engrams)
				for (let i = engrams; i < 10; i++)
					Component.create()
						.classes.add(InventoryClasses.Slot, InventorySlotViewClasses.PostmasterBucketEmptySlot)
						.appendTo(postmaster.engrams);
		}
	}

	private filter () {
		for (const [item, component] of this.itemMap) {
			const filteredOut = !this.super.definition.filter.apply(item);
			component.classes.toggle(filteredOut, InventorySlotViewClasses.ItemFilteredOut)
				.attributes.toggle(filteredOut, "tabindex", "-1");
		}
	}

	private getBucket (bucketId: BucketId) {
		return bucketId === "vault" ? this.vaultBucket
			: bucketId === "inventory" ? this.currentCharacter
				: PostmasterId.is(bucketId) ? this.postmasters[bucketId]
					: this.characters[bucketId];
	}

	private itemMoving?: ItemComponent;
	private createItemComponent (item: Item) {
		item.event.subscribe("bucketChange", this.update);
		const component = !item.canTransfer() ? ItemComponent.create([item]) : DraggableItem.create([item]);
		return !item.canTransfer() ? component : (component as DraggableItem)
			.event.subscribe("click", async event => {
				if (event.shiftKey)
					// update this item component's bucket so future clicks transfer to the right place
					await item.transferToggleVaulted(this.currentCharacter.character.characterId as CharacterId);
				else
					await item.equip(item.character ?? this.currentCharacter.character.characterId as CharacterId);
			})
			.event.subscribe("moveStart", event => {
				if (item.equipped)
					return event.preventDefault();

				component.classes.add(InventorySlotViewClasses.ItemMovingOriginal);
				const bucketComponent = this.getBucket(item.bucket);

				bucketComponent.classes.add(InventorySlotViewClasses.BucketMovingFrom);

				this.itemMoving?.remove();
				this.itemMoving = ItemComponent.create([item])
					.classes.add(InventorySlotViewClasses.ItemMoving)
					.setTooltipPadding(40)
					.appendTo(this);
			})
			.event.subscribe("move", event => {
				this.itemMoving?.style.set("--transform", `translate(${event.mouse.x}px, ${event.mouse.y}px)`);
				for (const [dropBucketId] of this.bucketEntries) {
					if (dropBucketId === "inventory" || PostmasterId.is(dropBucketId))
						continue;

					const component = this.getBucket(dropBucketId);
					component.classes.toggle(component.intersects(event.mouse), InventorySlotViewClasses.BucketDropTarget);
				}
			})
			.event.subscribe("moveEnd", async event => {
				this.itemMoving?.event.emit("mouseout", new MouseEvent("mouseout"));
				this.itemMoving?.remove();
				delete this.itemMoving;

				component.classes.remove(InventorySlotViewClasses.ItemMovingOriginal);
				const bucketComponent = this.getBucket(item.bucket);
				bucketComponent.classes.remove(InventorySlotViewClasses.BucketMovingFrom);

				let dropBucketId: DestinationBucketId | undefined;
				for (const [bucketId] of this.bucketEntries) {
					if (bucketId === "inventory" || PostmasterId.is(bucketId))
						continue;

					const component = this.getBucket(bucketId);
					component.classes.remove(InventorySlotViewClasses.BucketDropTarget);
					if (!component.intersects(event.mouse))
						continue;

					dropBucketId = bucketId;
				}

				if (dropBucketId)
					// update this item component's bucket so future clicks transfer to the right place
					await item.transferToBucket(dropBucketId);
			});
	}

	private onGlobalKeydown (event: IKeyEvent) {
		if (!document.contains(this.element)) {
			UiEventBus.unsubscribe("keydown", this.onGlobalKeydown);
			return;
		}

		if (this.filterer.isFiltered() && event.use("Escape")) {
			this.filterer.reset();
		}
	}
}

interface ISlotViewModelEvents {
	update: SlotViewModel;
}

const ProfileCharacters = Profile(DestinyComponentType.Characters);
class SlotViewModel {

	private static INSTANCE?: SlotViewModel;
	public static get () {
		return SlotViewModel.INSTANCE ??= new SlotViewModel();
	}

	public readonly event = new EventManager<this, ISlotViewModelEvents>(this);

	public items?: Record<ItemId, Item>;
	public buckets?: Record<BucketId, Bucket>;
	public characters?: DictionaryComponentResponse<DestinyCharacterComponent>;

	public constructor () {
		Items.event.subscribe("loading", () => LoadingManager.start(InventorySlotViewClasses.Main));
		Items.event.subscribe("loaded", ({ value }) => this.updateItems(value));
		ProfileCharacters.event.subscribe("loaded", ({ value }) =>
			// don't emit update separately for profile characters, that can be delayed to whenever the next item update is
			this.characters = value.characters);

		this.await = this.await.bind(this);
		this.onPageFocusChange = this.onPageFocusChange.bind(this);
		if (FocusManager.focused)
			this.onPageFocusChange(FocusManager);

		FocusManager.event.subscribe("changeFocusState", this.onPageFocusChange);
	}

	public async await (progress?: IModelGenerationApi) {
		if (InventorySlotView.hasExisted && !InventorySlotView.current)
			return this as Required<this>;

		const charactersLoadedPromise = ProfileCharacters.await();

		if (!this.characters) {
			progress?.subscribeProgress(ProfileCharacters, 1 / 2);
			await charactersLoadedPromise;
		}

		const itemsLoadedPromise = Items.await();
		if (!this.buckets) {
			progress?.subscribeProgress(Items, 1 / 2, 1 / 2);
			await itemsLoadedPromise;
		}

		progress?.emitProgress(2 / 2);
		return this as Required<this>;
	}

	private updateItems (buckets: Record<BucketId, Bucket>) {
		this.items ??= {};
		this.buckets = buckets;
		for (const [bucketId, bucket] of Object.entries(this.buckets)) {
			for (let i = 0; i < bucket.items.length; i++) {
				let newItem = bucket.items[i];
				// use old item if it exists
				newItem = this.items[newItem.id]?.update(newItem) ?? newItem;

				if (this.items[newItem.id] !== newItem)
					// if the new item instance is used, subscribe to its bucketChange event
					newItem.event.subscribe("bucketChange", ({ item, oldBucket, equipped }) => {
						// and on its bucket changing, remove it from its old bucket and put it in its new one
						Arrays.remove(this.buckets![oldBucket]?.items, item);
						this.buckets![item.bucket].items.push(item);

						// if this item is equipped now, make the previously equipped item not equipped
						if (equipped)
							for (const potentiallyEquippedItem of this.buckets![item.bucket].items)
								if (potentiallyEquippedItem.equipped && potentiallyEquippedItem !== item)
									delete potentiallyEquippedItem.equipped;
					});

				this.buckets[bucketId as BucketId]!.items[i] = this.items[newItem.id] = newItem;
			}
		}

		this.event.emit("update", this);
		LoadingManager.end(InventorySlotViewClasses.Main);
	}

	private interval?: number;
	private onPageFocusChange ({ focused }: { focused: boolean }) {
		if (focused)
			void this.await();
		clearInterval(this.interval);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this.interval = setInterval(this.await, focused ? Time.seconds(5) : Time.minutes(2));
	}
}

export default new View.Factory()
	.using(Model.createTemporary(async progress => SlotViewModel.get().await(progress)))
	.define<IInventorySlotViewDefinition>()
	.initialise((view, model) =>
		view.make(InventorySlotView, model));

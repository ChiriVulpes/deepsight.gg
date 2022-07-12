import type { DestinyCharacterComponent, DictionaryComponentResponse, ItemCategoryHashes } from "bungie-api-ts/destiny2";
import { DestinyComponentType } from "bungie-api-ts/destiny2";
import type { IModelGenerationApi } from "model/Model";
import Model from "model/Model";
import type { Bucket, BucketId, Item } from "model/models/Items";
import Items from "model/models/Items";
import Profile from "model/models/Profile";
import { InventoryClasses } from "ui/Classes";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
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
import EquipItem from "utility/endpoint/bungie/endpoint/destiny2/actions/items/EquipItem";
import TransferItem from "utility/endpoint/bungie/endpoint/destiny2/actions/items/TransferItem";
import { EventManager } from "utility/EventManager";
import Store from "utility/Store";
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
	SlotPendingRemoval = "view-inventory-slot-pending-removal",
	HighestPower = "view-inventory-slot-highest-power",
	ItemMoving = "view-inventory-slot-item-moving",
	ItemMovingOriginal = "view-inventory-slot-item-moving-original",
	BucketDropTarget = "view-inventory-slot-bucket-drop-target",
	BucketMovingFrom = "view-inventory-slot-bucket-moving-from",
	Hints = "view-inventory-slot-hints",
	ItemFilteredOut = "view-inventory-slot-item-filtered-out"
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

type DestinationBucketId = "vault" | `${bigint}`;

interface IInventorySlotViewDefinition {
	sort: SortManager;
	slot: ItemCategoryHashes;
	filter: FilterManager;
}

class InventorySlotViewWrapper extends View.WrapperComponent<[], View.IViewBase & IInventorySlotViewDefinition> { }

type InventorySlotViewArgs = [Required<SlotViewModel>];
class InventorySlotView extends Component.makeable<HTMLElement, InventorySlotViewArgs>().of(InventorySlotViewWrapper) {

	public model!: Required<SlotViewModel>;
	public vaultBucket!: BucketComponent;
	public currentCharacter!: CharacterBucket;
	public characterBucketsContainer!: Component;
	public characters!: Record<string, CharacterBucket>;
	public bucketEntries!: [BucketId, Bucket][];
	public items!: Record<string, Item>;
	public itemMap!: Map<Item, ItemComponent>;
	public transferringItemMap!: Map<Item, ItemComponent>;
	public unequippingItemMap!: Map<Item, ItemComponent>;
	public hints!: Component;
	public equipped!: Record<`${bigint}`, ItemComponent>;
	public filterer!: ItemFilter;

	protected override async onMake (model: Required<SlotViewModel>) {
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

		this.equipped = {};
		this.itemMap = new Map<Item, ItemComponent>();
		this.transferringItemMap = new Map<Item, ItemComponent>();
		this.unequippingItemMap = new Map<Item, ItemComponent>();

		this.update = this.update.bind(this);
		model.event.subscribe("update", this.update);
		this.event.subscribe("hide", () => {
			model.event.unsubscribe("update", this.update);
		});

		await this.update();

		this.super.footer.classes.add(InventorySlotViewClasses.Footer);

		this.sort = this.sort.bind(this);
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
		this.filter = this.filter.bind(this);
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

	private async update () {
		await this.transferring;
		this.updateCharacters();
		this.updateItems();
		this.sort();
		this.filter();
	}

	private updateItems () {
		this.itemMap.clear();
		this.transferringItemMap.clear();
		this.bucketEntries = Object.entries(this.model.buckets) as [BucketId, Bucket][];
		for (const [bucketId, bucket] of this.bucketEntries) {
			if (bucketId === "inventory" || bucketId === "postmaster")
				continue;

			for (const item of bucket.items) {
				const categories = item.definition.itemCategoryHashes ?? [];
				if (!categories.includes(this.super.definition.slot))
					continue;

				this.itemMap.set(item, this.createItemComponent(item, bucketId));
			}
		}
	}

	private updateCharacters () {
		this.characters ??= {};

		const oldBuckets = [...this.characterBucketsContainer.children<CharacterBucket>()];
		const characterBucketsSorted = Object.values(this.model.characters.data ?? {})
			.sort(({ dateLastPlayed: dateLastPlayedA }, { dateLastPlayed: dateLastPlayedB }) =>
				new Date(dateLastPlayedB).getTime() - new Date(dateLastPlayedA).getTime())
			.map(character => this.characters[character.characterId] ??= CharacterBucket.create([]).setCharacter(character));

		for (const oldCharacterBucket of oldBuckets)
			if (!characterBucketsSorted.includes(oldCharacterBucket))
				// this character was deleted
				oldCharacterBucket.remove();

		this.currentCharacter = characterBucketsSorted[0];

		const charactersChanged = characterBucketsSorted.length !== oldBuckets.length
			|| oldBuckets.some((bucket, i) => bucket.character.characterId !== characterBucketsSorted[i]?.character?.characterId);
		if (charactersChanged)
			this.characterBucketsContainer.append(...characterBucketsSorted);
	}

	private sort () {
		const highestPowerSlot: Component[] = [];
		let highestPower = 0;
		for (const [bucketId, bucket] of this.bucketEntries) {
			if (bucketId === "inventory" || bucketId === "postmaster")
				continue;

			let bucketComponent: BucketComponent;
			let equippedComponent: Component | undefined;
			if (bucketId === "vault")
				bucketComponent = this.vaultBucket;
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

			for (const slot of [...bucketComponent.content.children()])
				slot.classes.add(InventorySlotViewClasses.SlotPendingRemoval);

			for (const item of this.super.definition.sort.sort(bucket.items)) {
				let itemComponent = this.itemMap.get(item);
				if ((!item.equipped && !item.unequipping) && itemComponent?.parent() && !itemComponent.parent()!.classes.has(InventorySlotViewClasses.SlotPendingRemoval))
					itemComponent = this.transferringItemMap.get(item);

				if (!itemComponent)
					// item not included in view
					continue;

				const slot = item.equipped ? equippedComponent! : Component.create()
					.classes.add(InventoryClasses.Slot)
					.appendTo(bucketComponent.content);

				itemComponent
					.setSortedBy(this.super.definition.sort)
					.appendTo(slot);

				if (item.equipped)
					this.equipped[bucketId as `${bigint}`] = itemComponent;

				const power = item.instance?.primaryStat?.value ?? 0;
				if (power > highestPower) {
					highestPower = power;
					highestPowerSlot.splice(0, Infinity, slot);
				} else if (power === highestPower) {
					highestPowerSlot.push(slot);
				}
			}

			// clean up old slots
			for (const slot of [...bucketComponent.content.children()])
				if (slot.classes.has(InventorySlotViewClasses.SlotPendingRemoval))
					slot.remove();
		}

		for (const [item, newComponent] of [...this.transferringItemMap]) {
			const existing = this.itemMap.get(item);
			if (document.contains(newComponent.element) && !document.contains(existing?.element ?? null)) {
				this.itemMap.set(item, newComponent);
				this.transferringItemMap.delete(item);
			}
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

	private itemMoving?: ItemComponent;
	private createItemComponent (item: Item, bucketId: DestinationBucketId) {
		const component = DraggableItem.create([item]);
		return component
			.event.subscribe("click", async event => {
				if (event.shiftKey)
					// update this item component's bucket so future clicks transfer to the right place
					bucketId = await this.transfer(item, bucketId);
				else
					await this.equip(item, bucketId);
			})
			.event.subscribe("moveStart", event => {
				if (item.equipped)
					return event.preventDefault();

				component.classes.add(InventorySlotViewClasses.ItemMovingOriginal);
				const bucketComponent = bucketId === "vault" ? this.vaultBucket : this.characters[bucketId];
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
					if (dropBucketId === "inventory" || dropBucketId === "postmaster")
						continue;

					const component = dropBucketId === "vault" ? this.vaultBucket : this.characters[dropBucketId];
					component.classes.toggle(component.intersects(event.mouse), InventorySlotViewClasses.BucketDropTarget);
				}
			})
			.event.subscribe("moveEnd", async event => {
				this.itemMoving?.event.emit("mouseout", new MouseEvent("mouseout"));
				this.itemMoving?.remove();
				delete this.itemMoving;

				component.classes.remove(InventorySlotViewClasses.ItemMovingOriginal);
				const bucketComponent = bucketId === "vault" ? this.vaultBucket : this.characters[bucketId];
				bucketComponent.classes.remove(InventorySlotViewClasses.BucketMovingFrom);

				let dropBucketId: DestinationBucketId | undefined;
				for (const [bucketId] of this.bucketEntries) {
					if (bucketId === "inventory" || bucketId === "postmaster")
						continue;

					const component = bucketId === "vault" ? this.vaultBucket : this.characters[bucketId];
					component.classes.remove(InventorySlotViewClasses.BucketDropTarget);
					if (!component.intersects(event.mouse))
						continue;

					dropBucketId = bucketId;
				}

				if (dropBucketId)
					// update this item component's bucket so future clicks transfer to the right place
					bucketId = await this.transfer(item, bucketId, dropBucketId);
			});
	}

	private transferring?: Promise<void>;
	private async transfer (item: Item, bucketId: DestinationBucketId, destination?: DestinationBucketId) {
		if (item.equipped)
			// items can't be unequipped with fvm
			return bucketId;

		if (item.transferring)
			// item is already moving
			return bucketId;

		let characterId: `${bigint}`;
		if (bucketId === "vault") {
			characterId = this.currentCharacter.character.characterId as `${bigint}`;
			destination ??= characterId;
		} else {
			characterId = bucketId;
			destination ??= "vault";
		}

		if (destination === bucketId)
			// already in that location
			return bucketId;

		// only allow transferring one item at a time
		while (this.transferring)
			await this.transferring;

		let finalDestination = destination;

		// eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
		this.transferring = new Promise<void>(async resolve => {
			this.transferringItemMap.set(item, this.createItemComponent(item, destination!));
			item.transferring = true;
			this.model.buckets[destination!].items.push(item);
			this.sort();

			let movedToVault = false;
			let success: boolean | undefined;
			if (bucketId !== "vault" && destination !== "vault" && destination !== characterId) {
				// first transfer to vault
				success = await TransferItem.query(item, characterId, "vault")
					.then(() => true)
					.catch(err => { console.log(err); return false });
				if (success)
					characterId = destination!, movedToVault = true;
			}

			if (success !== false)
				success = await TransferItem.query(item, characterId, destination)
					.then(() => true)
					.catch(err => { console.log(err); return false });

			item.transferring = false;

			if (!success && movedToVault) {
				let inVault = true;
				if (!Store.items.settingsDisableReturnOnFailure)
					// put the item back where it was originally
					inVault = !await TransferItem.query(item, bucketId as `${bigint}`, bucketId)
						.then(() => true)
						.catch(err => { console.log(err); return false });

				if (inVault) {
					// the full transfer failed and now the item is in the vault
					finalDestination = "vault";
					this.model.buckets.vault.items.push(item);
					// remove the item from the original location since it's not there anymore
					Arrays.remove(this.model.buckets[bucketId].items, item);
				} else {
					finalDestination = bucketId;
				}
			}

			// remove item from old bucket if move successful, remove temp item from destination otherwise
			Arrays.remove(this.model.buckets[success ? bucketId : destination!].items, item);
			this.sort();

			console.log(bucketId, destination);
			resolve();
		});

		await this.transferring;
		delete this.transferring;

		return finalDestination;
	}

	private async equip (item: Item, bucketId: DestinationBucketId) {
		if (item.equipped)
			// items can't be unequipped with fvm
			return bucketId;

		if (item.transferring)
			// item is already moving
			return bucketId;

		if (bucketId === "vault")
			bucketId = await this.transfer(item, bucketId);

		if (bucketId === "vault")
			// failed
			return bucketId;

		const characterId = bucketId;

		// only allow transferring one item at a time
		while (this.transferring)
			await this.transferring;

		// eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
		this.transferring = new Promise<void>(async resolve => {
			const currentlyEquipped = this.equipped[characterId];
			currentlyEquipped.item.transferring = true;
			item.transferring = true;
			this.sort();

			const success = await EquipItem.query(item, characterId)
				.then(() => true)
				.catch(err => { console.log(err); return false });

			if (success) {
				item.equipped = true;
				delete currentlyEquipped.item.equipped;
			}

			currentlyEquipped.item.transferring = false;
			item.transferring = false;
			this.model.buckets[characterId].items
			currentlyEquipped.item.unequipping = true;
			this.sort();
			currentlyEquipped.item.unequipping = false;

			resolve();
		});

		await this.transferring;
		delete this.transferring;
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

	public buckets?: Record<BucketId, Bucket>;
	public characters?: DictionaryComponentResponse<DestinyCharacterComponent>;

	public constructor () {
		Items.event.subscribe("loading", () => LoadingManager.start(InventorySlotViewClasses.Main));
		Items.event.subscribe("loaded", ({ value }) => {
			this.buckets = value;
			this.event.emit("update", this);
			LoadingManager.end(InventorySlotViewClasses.Main);
		});
		ProfileCharacters.event.subscribe("loaded", ({ value }) =>
			// don't emit update separately for profile characters, that can be delayed to whenever the next item update is
			this.characters = value.characters);

		this.await = this.await.bind(this);
		this.onPageFocus = this.onPageFocus.bind(this);
		this.onPageBlur = this.onPageBlur.bind(this);
		if (document.hasFocus())
			this.onPageFocus();

		window.addEventListener("focus", this.onPageFocus);
		window.addEventListener("blur", this.onPageBlur);
	}

	public async await (progress?: IModelGenerationApi) {
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

	private interval?: number;
	private onPageFocus () {
		void this.await();
		clearInterval(this.interval);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this.interval = setInterval(this.await, Time.seconds(5));
	}

	private onPageBlur () {
		clearInterval(this.interval);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this.interval = setInterval(this.await, Time.minutes(2));
	}
}

export default new View.Factory()
	.using(Model.createTemporary(async progress => SlotViewModel.get().await(progress)))
	.define<IInventorySlotViewDefinition>()
	.initialise((view, model) =>
		view.make(InventorySlotView, model));

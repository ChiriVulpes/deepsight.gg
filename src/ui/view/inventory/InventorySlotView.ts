import type { DestinyCharacterComponent, DictionaryComponentResponse } from "bungie-api-ts/destiny2";
import { DestinyComponentType } from "bungie-api-ts/destiny2";
import type { DestinyGeneratedEnums, ItemCategoryHashes } from "bungie-api-ts/generated-enums";
import type { DestinyEnumHelper } from "model/models/DestinyEnums";
import DestinyEnums from "model/models/DestinyEnums";
import type { Bucket, BucketId, Item } from "model/models/Items";
import Items from "model/models/Items";
import Profile from "model/models/Profile";
import { InventoryClasses } from "ui/Classes";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import type { IDraggableEvents } from "ui/form/Draggable";
import Draggable from "ui/form/Draggable";
import BucketComponent from "ui/inventory/Bucket";
import ItemComponent from "ui/inventory/Item";
import ItemSort from "ui/inventory/ItemSort";
import type SortManager from "ui/inventory/SortManager";
import View from "ui/View";
import Arrays from "utility/Arrays";
import TransferItem from "utility/endpoint/bungie/endpoint/destiny2/actions/items/TransferItem";

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
	BucketDropTarget = "view-inventory-slot-bucket-drop-target"
}

class CharacterBucket extends BucketComponent<[DestinyCharacterComponent]> {

	public character!: DestinyCharacterComponent;
	public equippedSlot!: Component;

	protected override onMake (character: DestinyCharacterComponent): void {
		super.onMake(character);
		this.classes.add(InventorySlotViewClasses.CharacterBucket);

		this.character = character;

		Component.create()
			.classes.add(InventorySlotViewClasses.CharacterBucketEmblem, InventoryClasses.Slot)
			.appendTo(this.header);

		this.equippedSlot = Component.create()
			.classes.add(InventorySlotViewClasses.CharacterBucketEquipped, InventoryClasses.Slot)
			.appendTo(this);

		this.inventory.classes.add(InventorySlotViewClasses.CharacterBucketInventory);

		void this.initialiseFromCharacter(character);
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
	slot: (hashes: DestinyEnumHelper<DestinyGeneratedEnums["ItemCategoryHashes"]>) => ItemCategoryHashes;
}

class InventorySlotViewWrapper extends View.WrapperComponent<[], View.IViewBase & IInventorySlotViewDefinition> { }

type InventorySlotViewArgs = [Record<BucketId, Bucket>, DictionaryComponentResponse<DestinyCharacterComponent>];
class InventorySlotView extends Component.makeable<HTMLElement, InventorySlotViewArgs>().of(InventorySlotViewWrapper) {

	public vaultBucket!: BucketComponent;
	public currentCharacter!: CharacterBucket;
	public characters!: Record<string, CharacterBucket>;
	public buckets!: Record<BucketId, Bucket>;
	public bucketEntries!: [BucketId, Bucket][];
	public itemMap!: Map<Item, ItemComponent>;
	public transferringItemMap!: Map<Item, ItemComponent>;

	protected override async onMake (...[buckets, profileCharacters]: InventorySlotViewArgs) {
		if (!profileCharacters.data || !Object.keys(profileCharacters.data).length) {
			console.warn("No characters");
			return;
		}

		this.buckets = buckets;

		this.classes.add(InventorySlotViewClasses.Main);
		this.super.content.classes.add(InventorySlotViewClasses.Content);

		const { ItemCategoryHashes } = await DestinyEnums.await();

		const characterBuckets = Component.create()
			.classes.add(InventorySlotViewClasses.CharacterBuckets)
			.appendTo(this.super.content);

		this.vaultBucket = BucketComponent.create()
			.classes.add(InventorySlotViewClasses.VaultBucket)
			.tweak(vault => vault.icon.style.set("--icon",
				"url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/vault2.svg\")"))
			.tweak(vault => vault.title.text.add("Vault"))
			.appendTo(this.super.content);

		const characterBucketsSorted = Object.values(profileCharacters.data)
			.sort(({ dateLastPlayed: dateLastPlayedA }, { dateLastPlayed: dateLastPlayedB }) =>
				new Date(dateLastPlayedB).getTime() - new Date(dateLastPlayedA).getTime())
			.map(character => CharacterBucket.create([character]));

		characterBuckets.append(...characterBucketsSorted);

		this.characters = Object.fromEntries(characterBucketsSorted.map(bucket => [
			bucket.character.characterId,
			bucket,
		]));

		this.currentCharacter = characterBucketsSorted[0];

		this.itemMap = new Map<Item, ItemComponent>();
		this.transferringItemMap = new Map<Item, ItemComponent>();

		this.bucketEntries = Object.entries(buckets) as [BucketId, Bucket][];
		for (const [bucketId, bucket] of this.bucketEntries) {
			if (bucketId === "inventory" || bucketId === "postmaster")
				continue;

			for (const item of this.super.definition.sort.sort(bucket.items)) {
				const categories = item.definition.itemCategoryHashes ?? [];
				if (!categories.includes(this.super.definition.slot(ItemCategoryHashes)))
					continue;

				this.itemMap.set(item, this.createItemComponent(item, bucketId));
			}
		}

		this.sort();

		this.super.footer.classes.add(InventorySlotViewClasses.Footer);

		this.sort = this.sort.bind(this);
		ItemSort.create([this.super.definition.sort])
			.event.subscribe("sort", this.sort)
			.appendTo(this.super.footer);
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
			}

			equippedComponent?.classes.remove(InventorySlotViewClasses.HighestPower);

			for (const slot of [...bucketComponent.inventory.children()])
				slot.classes.add(InventorySlotViewClasses.SlotPendingRemoval);

			for (const item of this.super.definition.sort.sort(bucket.items)) {
				let itemComponent = this.itemMap.get(item);
				if (!item.equipped && itemComponent?.parent() && !itemComponent.parent()!.classes.has(InventorySlotViewClasses.SlotPendingRemoval))
					itemComponent = this.transferringItemMap.get(item);

				if (!itemComponent)
					// item not included in view
					continue;

				const slot = item.equipped ? equippedComponent! : Component.create()
					.classes.add(InventoryClasses.Slot)
					.appendTo(bucketComponent.inventory);

				itemComponent
					.setSortedBy(this.super.definition.sort)
					.appendTo(slot);

				const power = item.instance?.primaryStat?.value ?? 0;
				if (power > highestPower) {
					highestPower = power;
					highestPowerSlot.splice(0, Infinity, slot);
				} else if (power === highestPower) {
					highestPowerSlot.push(slot);
				}
			}

			// clean up old slots
			for (const slot of [...bucketComponent.inventory.children()])
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

	private itemMoving?: ItemComponent;
	private createItemComponent (item: Item, bucketId: DestinationBucketId) {
		const component = DraggableItem.create([item]);
		return component
			.event.subscribe("click", async () => {
				// update this item component's bucket so future clicks transfer to the right place
				bucketId = await this.transfer(item, bucketId);
			})
			.event.subscribe("moveStart", event => {
				if (item.equipped)
					return event.preventDefault();

				component.classes.add(InventorySlotViewClasses.ItemMovingOriginal);

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

		this.transferringItemMap.set(item, this.createItemComponent(item, destination));
		item.transferring = true;
		this.buckets[destination].items.push(item);
		this.sort();

		const success = await TransferItem.query(item, characterId, destination)
			.then(() => true)
			.catch(err => { console.log(err); return false });

		item.transferring = false;
		// remove item from old bucket if move successful, remove temp item from destination otherwise
		Arrays.remove(this.buckets[success ? bucketId : destination].items, item);
		this.sort();

		console.log(bucketId, destination);
		return destination;
	}
}

export default new View.Factory()
	.using(Items, Profile(DestinyComponentType.Characters))
	.define<IInventorySlotViewDefinition>()
	.initialise((view, buckets, profile) =>
		view.make(InventorySlotView, buckets, profile.characters));

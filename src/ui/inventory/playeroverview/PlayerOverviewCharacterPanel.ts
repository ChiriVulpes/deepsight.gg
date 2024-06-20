import { InventoryBucketHashes, TraitHashes } from "@deepsight.gg/enums";
import type { Character } from "model/models/Characters";
import type Inventory from "model/models/Inventory";
import type { Bucket } from "model/models/items/Bucket";
import type Item from "model/models/items/Item";
import { Classes } from "ui/Classes";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import InfoBlock from "ui/InfoBlock";
import ClassPicker from "ui/form/ClassPicker";
import ItemComponent from "ui/inventory/ItemComponent";
import ItemPowerLevel from "ui/inventory/ItemPowerLevel";
import ItemSubclassTooltip from "ui/inventory/ItemSubclassTooltip";
import Slot from "ui/inventory/Slot";
import LoadoutsComponent from "ui/inventory/playeroverview/LoadoutsComponent";
import StatsOverview from "ui/inventory/playeroverview/StatsOverview";
import { InventorySlotViewHandler } from "ui/view/inventory/slot/IInventorySlotView";
import InventoryArmsView from "ui/view/inventory/slot/InventoryArmsView";
import InventoryChestView from "ui/view/inventory/slot/InventoryChestView";
import InventoryClassItemView from "ui/view/inventory/slot/InventoryClassItemView";
import InventoryEnergyView from "ui/view/inventory/slot/InventoryEnergyView";
import InventoryHelmetView from "ui/view/inventory/slot/InventoryHelmetView";
import InventoryKineticView from "ui/view/inventory/slot/InventoryKineticView";
import InventoryLegsView from "ui/view/inventory/slot/InventoryLegsView";
import InventoryPowerView from "ui/view/inventory/slot/InventoryPowerView";
import ProfileManager from "utility/ProfileManager";
import Maths from "utility/maths/Maths";

export enum PlayerOverviewCharacterPanelClasses {
	Main = "player-overview-drawer-panel",
	CharacterSettings = "player-overview-character-settings",
	CharacterWrapper = "player-overview-character-wrapper",
	SubclassPicker = "player-overview-subclass-picker",
	SlotGroup = "player-overview-slot-group",
	Slot = "player-overview-slot",
	SlotOption = "player-overview-slot-option",
	SlotOptionEquipped = "player-overview-slot-option-equipped",
	SlotOptionHighestPower = "player-overview-slot-option-highest-power",
	OverviewSlot = "player-overview-slot-overview",
	Item = "player-overview-item",
	ItemEquipped = "player-overview-item-equipped",
	ItemHighestPower = "player-overview-item-highest-power",
	ItemSame = "player-overview-item-same",
	Power = "player-overview-power",
	PowerTotal = "player-overview-power-total",
	PowerEquipped = "player-overview-power-equipped",
	PowerHighestPower = "player-overview-power-highest-power",
	PowerTotalLabel = "player-overview-power-total-label",
	PowerTotalLabelEquipped = "player-overview-power-total-label-equipped",
	PowerTotalLabelHighestPower = "player-overview-power-total-label-highest-power",
	LoadoutsButton = "player-overview-loadouts-button",
	LoadoutsButtonIcon = "player-overview-loadouts-button-icon",
	LoadoutsButtonIcon1 = "player-overview-loadouts-button-icon-1",
	LoadoutsButtonIcon2 = "player-overview-loadouts-button-icon-2",
	LoadoutsButtonIcon3 = "player-overview-loadouts-button-icon-3",
	ArtifactSlot = "player-overview-artifact-slot",
	Artifact = "player-overview-artifact",
	StatsOverviewBlock = "player-overview-stats-overview-block",
	_LoadoutsVisible = "player-overview-drawer-panel--loadouts-visible",
	SubclassPrismatic = "player-overview-subclass-prismatic",
}

const slotViews = [
	[
		InventoryKineticView,
		InventoryEnergyView,
		InventoryPowerView,
	],
	[
		InventoryHelmetView,
		InventoryArmsView,
		InventoryChestView,
		InventoryLegsView,
		InventoryClassItemView,
	],
];

export interface PlayerOverviewCharacterPanelEvents extends ComponentEvents {
	toggleLoadouts: { visible: boolean };
}

export default class PlayerOverviewCharacterPanel extends Component<HTMLElement, []> {

	public override event!: ComponentEventManager<this, PlayerOverviewCharacterPanelEvents>;

	private previousItemInstanceIds?: string[];

	public subclassPicker!: ClassPicker<number>;
	public powerTotalEquipped!: ItemPowerLevel;
	public powerTotalHighest!: ItemPowerLevel;
	public slotComponents!: Record<string | InventoryBucketHashes, SlotComponent>;
	public loadoutsCheckboxInternal!: Component<HTMLInputElement>;
	public loadoutsButton!: Component;
	public artifactSlot!: Component;
	public artifact!: ItemComponent;
	public loadouts!: LoadoutsComponent;
	public statsOverview!: StatsOverview;

	protected override onMake (): void {
		this.classes.add(PlayerOverviewCharacterPanelClasses.Main);

		const wrapper = Component.create()
			.classes.add(PlayerOverviewCharacterPanelClasses.CharacterWrapper)
			.appendTo(this);

		const characterSettings = Component.create()
			.classes.add(PlayerOverviewCharacterPanelClasses.CharacterSettings)
			.appendTo(wrapper);

		this.subclassPicker = (ClassPicker.create([]) as ClassPicker<number>)
			.classes.add(PlayerOverviewCharacterPanelClasses.SubclassPicker)
			.setDisabled(!ProfileManager.isAuthenticated())
			.event.subscribe("selectClass", event => {
				if (event.item?.character)
					event.setPromise(event.item.equip(event.item.character.characterId));
			})
			.appendTo(characterSettings);

		const checkboxId = `checkbox-${Math.random().toString().slice(2)}`;
		this.loadoutsCheckboxInternal = Component.create("input")
			.attributes.set("type", "checkbox")
			.attributes.set("id", checkboxId)
			.classes.add(Classes.Hidden)
			.event.subscribe("change", _ => this.event.emit("toggleLoadouts", { visible: this.loadoutsCheckboxInternal.element.checked }))
			.appendTo(characterSettings);

		this.loadoutsButton = Component.create("label")
			.attributes.set("for", checkboxId)
			.classes.add(PlayerOverviewCharacterPanelClasses.LoadoutsButton)
			.append(Component.create()
				.classes.add(PlayerOverviewCharacterPanelClasses.LoadoutsButtonIcon, PlayerOverviewCharacterPanelClasses.LoadoutsButtonIcon1))
			.append(Component.create()
				.classes.add(PlayerOverviewCharacterPanelClasses.LoadoutsButtonIcon, PlayerOverviewCharacterPanelClasses.LoadoutsButtonIcon2))
			.append(Component.create()
				.classes.add(PlayerOverviewCharacterPanelClasses.LoadoutsButtonIcon, PlayerOverviewCharacterPanelClasses.LoadoutsButtonIcon3))
			.appendTo(characterSettings);

		this.artifactSlot = Slot.create()
			.classes.add(PlayerOverviewCharacterPanelClasses.ArtifactSlot)
			.appendTo(characterSettings);

		this.artifact = ItemComponent.create([])
			.classes.add(PlayerOverviewCharacterPanelClasses.Artifact, Classes.Hidden)
			.appendTo(this.artifactSlot);

		this.loadouts = LoadoutsComponent.create()
			.appendTo(wrapper);

		const slotComponent = Component.create()
			.classes.add(PlayerOverviewCharacterPanelClasses.Slot, PlayerOverviewCharacterPanelClasses.OverviewSlot)
			.appendTo(wrapper);

		const slotOptionHighestPower = Component.create()
			.classes.add(PlayerOverviewCharacterPanelClasses.SlotOption, PlayerOverviewCharacterPanelClasses.SlotOptionHighestPower)
			.appendTo(slotComponent);

		const slotOptionEquipped = Component.create()
			.classes.add(PlayerOverviewCharacterPanelClasses.SlotOption, PlayerOverviewCharacterPanelClasses.SlotOptionEquipped)
			.appendTo(slotComponent);

		Component.create()
			.text.add("Equipped")
			.classes.add(PlayerOverviewCharacterPanelClasses.PowerTotalLabel, PlayerOverviewCharacterPanelClasses.PowerTotalLabelEquipped)
			.appendTo(slotOptionEquipped);

		this.powerTotalEquipped = ItemPowerLevel.create([])
			.classes.add(PlayerOverviewCharacterPanelClasses.Power, PlayerOverviewCharacterPanelClasses.PowerTotal, PlayerOverviewCharacterPanelClasses.PowerEquipped)
			.appendTo(slotOptionEquipped);

		Component.create()
			.text.add("Max")
			.classes.add(PlayerOverviewCharacterPanelClasses.PowerTotalLabel, PlayerOverviewCharacterPanelClasses.PowerTotalLabelHighestPower)
			.appendTo(slotOptionHighestPower);

		this.powerTotalHighest = ItemPowerLevel.create([])
			.classes.add(PlayerOverviewCharacterPanelClasses.Power, PlayerOverviewCharacterPanelClasses.PowerTotal, PlayerOverviewCharacterPanelClasses.PowerHighestPower)
			.appendTo(slotOptionHighestPower);

		this.slotComponents = {} as Record<string | InventoryBucketHashes, SlotComponent>;
		for (let groupIndex = 0; groupIndex < slotViews.length; groupIndex++) {
			const viewGroup = slotViews[groupIndex];
			const groupColumn = Component.create()
				.classes.add(PlayerOverviewCharacterPanelClasses.SlotGroup)
				.appendTo(wrapper);

			for (const view of viewGroup) {
				this.slotComponents[view.definition.slot] = SlotComponent.create([groupIndex])
					.classes.add(PlayerOverviewCharacterPanelClasses.Slot)
					.appendTo(groupColumn);
			}
		}

		InfoBlock.create()
			.classes.add(PlayerOverviewCharacterPanelClasses.StatsOverviewBlock)
			.append(this.statsOverview = StatsOverview.create())
			.appendTo(this);
	}

	public set (inventory: Inventory, character: Character, buckets: Bucket[]) {
		const seasonalArtifact = buckets.find(bucket => bucket.is(InventoryBucketHashes.SeasonalArtifact));
		void this.artifact.setItem(seasonalArtifact?.equippedItem);
		this.artifact.classes.toggle(!seasonalArtifact?.equippedItem, Classes.Hidden);

		this.loadouts.set(inventory, character);

		this.statsOverview.set(character, buckets);

		for (const subclass of inventory.getBucket(InventoryBucketHashes.Subclass, character.characterId)?.items ?? []) {
			this.subclassPicker.addOption({
				id: subclass.definition.hash,
				background: `https://www.bungie.net${subclass.definition.displayProperties.icon}`,
				item: subclass,
				initialise: button => button
					.classes.toggle(subclass.definition.traitHashes.includes(TraitHashes.ItemSubclassPrism), PlayerOverviewCharacterPanelClasses.SubclassPrismatic)
					.setTooltip(ItemSubclassTooltip, {
						initialise: tooltip => tooltip.set(subclass),
						differs: tooltip => tooltip.item?.id !== subclass.id,
					}),
			});
			if (subclass.equipped)
				void this.subclassPicker.setCurrent(subclass.definition.hash, true);
		}

		const equippedItems: Partial<Record<InventoryBucketHashes, Item>> = {};
		const highestPowerItems: Partial<Record<InventoryBucketHashes, Item>> = {};
		for (const item of buckets.flatMap(bucket => bucket.items)) {
			const view = slotViews.flat().find(view => item.definition.inventory?.bucketTypeHash === view.definition.slot);
			if (!view)
				continue;

			const slot = view.definition.slot;
			if (item.equipped)
				equippedItems[slot] = item;

			const highestPower = highestPowerItems[slot]?.instance?.primaryStat?.value ?? 0;
			const itemPower = item.instance?.primaryStat?.value ?? 0;
			if (itemPower > highestPower || (itemPower === highestPower && item.equipped))
				highestPowerItems[slot] = item;
		}

		const currentPower = Maths.average(...Object.values(equippedItems)
			.map(item => item?.instance?.primaryStat?.value ?? 0));

		const maximisedPower = Maths.average(...Object.values(highestPowerItems)
			.map(item => item?.instance?.primaryStat?.value ?? 0));

		this.powerTotalEquipped.setPower(currentPower);
		this.powerTotalHighest.setPower(maximisedPower);

		const equippedLog: any[] = [];
		const highestPowerLog: any[] = [];
		const previous = this.previousItemInstanceIds ??= [];
		let i = 0;

		for (let groupIndex = 0; groupIndex < slotViews.length; groupIndex++) {
			const viewGroup = slotViews[groupIndex];

			for (const view of viewGroup) {
				const slot = view.definition.slot;

				let name = view.definition.name ?? "Unknown View";
				if (typeof name === "function")
					name = name();

				const equippedItem = equippedItems[slot];
				if (!equippedItem) {
					console.warn(`No equipped item for slot ${name}`);
					continue;
				}

				const slotComponent = this.slotComponents[slot]
					.attributes.set("data-name", name);

				if (previous[i++] !== equippedItem.reference.itemInstanceId) {
					equippedLog.push(`\n    ${name}:`, equippedItem?.definition.displayProperties.name, equippedItem);
					previous[i - 1] = equippedItem.reference.itemInstanceId!;
				}

				const highestPowerItem = highestPowerItems[slot];
				if (!highestPowerItem)
					console.warn(`No highest power item for slot ${name}`);
				else {
					if (previous[i++] !== highestPowerItem.reference.itemInstanceId) {
						highestPowerLog.push(`\n    ${name}:`, highestPowerItem?.definition.displayProperties.name, highestPowerItem);
						previous[i - 1] = highestPowerItem.reference.itemInstanceId!;
					}
				}

				slotComponent.set(inventory, equippedItem, highestPowerItem, maximisedPower);
			}
		}

		if (equippedLog.length || highestPowerLog.length)
			console.log(character.class.displayProperties.name,
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
				...!equippedLog.length ? [] : [`\n  Equipped Items - ${Math.floor(currentPower)}${currentPower % 1 ? ` ${(currentPower % 1) * 8}/8` : ""}`, ...equippedLog],
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
				...!highestPowerLog.length ? [] : [`\n\n  Highest Power Items - ${Math.floor(maximisedPower)}${maximisedPower % 1 ? ` ${(maximisedPower % 1) * 8}/8` : ""}`, ...highestPowerLog]
			);
	}
}

class SlotComponent extends Component<HTMLElement, [type: number]> {

	public itemEquipped!: ItemComponent;
	public itemHighestPower!: ItemComponent;
	public itemHighestPowerIsSame!: Component;
	public powerLevelEquipped!: ItemPowerLevel;
	public powerLevelHighest!: ItemPowerLevel;

	protected override onMake (type: 0 | 1): void {
		const slotOptionEquipped = Component.create()
			.classes.add(PlayerOverviewCharacterPanelClasses.SlotOption, PlayerOverviewCharacterPanelClasses.SlotOptionEquipped);

		const slotOptionHighestPower = Component.create()
			.classes.add(PlayerOverviewCharacterPanelClasses.SlotOption, PlayerOverviewCharacterPanelClasses.SlotOptionHighestPower);

		if (type === 0)
			this.append(slotOptionHighestPower, slotOptionEquipped);
		else
			this.append(slotOptionEquipped, slotOptionHighestPower);

		this.itemEquipped = ItemComponent.create([])
			.classes.add(PlayerOverviewCharacterPanelClasses.Item, PlayerOverviewCharacterPanelClasses.ItemEquipped)
			.appendTo(slotOptionEquipped);

		this.powerLevelEquipped = ItemPowerLevel.create([])
			.classes.add(PlayerOverviewCharacterPanelClasses.Power, PlayerOverviewCharacterPanelClasses.PowerEquipped)
			.appendTo(slotOptionEquipped);

		this.itemHighestPowerIsSame = Component.create()
			.classes.add(PlayerOverviewCharacterPanelClasses.Item, PlayerOverviewCharacterPanelClasses.ItemHighestPower, PlayerOverviewCharacterPanelClasses.ItemSame)
			.appendTo(slotOptionHighestPower);

		this.itemHighestPower = ItemComponent.create([])
			.classes.add(PlayerOverviewCharacterPanelClasses.Item, PlayerOverviewCharacterPanelClasses.ItemHighestPower)
			.appendTo(slotOptionHighestPower);

		this.powerLevelHighest = ItemPowerLevel.create([])
			.classes.add(PlayerOverviewCharacterPanelClasses.Power, PlayerOverviewCharacterPanelClasses.PowerHighestPower)
			.appendTo(slotOptionHighestPower);
	}

	public set (inventory: Inventory, equippedItem: Item, highestPowerItem: Item | undefined, maximisedTotalPower: number) {
		void this.itemEquipped.setSortedBy(InventorySlotViewHandler.getSorter(equippedItem))
			.setItem(equippedItem, inventory);

		const equippedPower = equippedItem.instance?.primaryStat?.value ?? 0;
		this.powerLevelEquipped.setPower(equippedPower, equippedPower - Math.floor(maximisedTotalPower));

		if (!highestPowerItem || highestPowerItem === equippedItem) {
			this.itemHighestPowerIsSame.classes.remove(Classes.Hidden);
			this.itemHighestPower.classes.add(Classes.Hidden);
			return;
		}

		this.itemHighestPowerIsSame.classes.add(Classes.Hidden);
		this.itemHighestPower.classes.remove(Classes.Hidden);

		void this.itemHighestPower.setSortedBy(InventorySlotViewHandler.getSorter(highestPowerItem))
			.setItem(highestPowerItem, inventory);

		const highestPowerPower = highestPowerItem.instance?.primaryStat?.value ?? 0;
		this.powerLevelHighest.setPower(highestPowerPower, highestPowerPower - Math.floor(maximisedTotalPower));
	}
}

import type { InventoryBucketHashes } from "@deepsight.gg/enums";
import type { DestinyClass } from "bungie-api-ts/destiny2";
import type { UserMembershipData } from "bungie-api-ts/user";
import type Character from "model/models/Characters";
import Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type { Bucket, CharacterId } from "model/models/items/Item";
import Memberships from "model/models/Memberships";
import BaseComponent from "ui/Component";
import ClassPicker from "ui/form/ClassPicker";
import Drawer from "ui/form/Drawer";
import InfoBlock from "ui/InfoBlock";
import ItemComponent from "ui/inventory/ItemComponent";
import ItemPowerLevel from "ui/inventory/ItemPowerLevel";
import Loadable from "ui/Loadable";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import { IInventoryViewDefinition } from "ui/view/inventory/InventoryView";
import InventoryArmsView from "ui/view/inventory/slot/InventoryArmsView";
import InventoryChestView from "ui/view/inventory/slot/InventoryChestView";
import InventoryClassItemView from "ui/view/inventory/slot/InventoryClassItemView";
import InventoryEnergyView from "ui/view/inventory/slot/InventoryEnergyView";
import InventoryHelmetView from "ui/view/inventory/slot/InventoryHelmetView";
import InventoryKineticView from "ui/view/inventory/slot/InventoryKineticView";
import InventoryLegsView from "ui/view/inventory/slot/InventoryLegsView";
import InventoryPowerView from "ui/view/inventory/slot/InventoryPowerView";
import Arrays from "utility/Arrays";
import Bound from "utility/decorator/Bound";
import Maths from "utility/maths/Maths";

export enum PlayerOverviewClasses {
	Main = "player-overview",
	Container = "player-overview-container",
	Identity = "player-overview-identity",
	IdentityUsername = "player-overview-identity-username",
	IdentityCode = "player-overview-identity-code",
	Drawer = "player-overview-drawer",
	Panel = "player-overview-drawer-panel",
	ClassSelection = "player-overview-class-selection",
	CharacterPicker = "player-overview-character-picker",
	CharacterPickerButton = "player-overview-character-picker-button",
	Slot = "player-overview-slot",
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
}

namespace PlayerOverview {

	export class Component extends BaseComponent<HTMLElement, [UserMembershipData, Inventory]> {
		public drawer!: Drawer;
		private inventory!: Inventory;
		public currencyOverview!: InfoBlock;
		public classSelection!: BaseComponent;
		public statsOverview!: InfoBlock;
		public characterPicker!: ClassPicker<CharacterId>;
		private panels!: Record<CharacterId, BaseComponent>;

		public displayName!: string;
		public code!: string;

		protected override onMake (memberships: UserMembershipData, inventory: Inventory): void {
			this.classes.add(PlayerOverviewClasses.Main);
			this.inventory = inventory;
			this.displayName = memberships.bungieNetUser.cachedBungieGlobalDisplayName;
			this.code = `${memberships.bungieNetUser.cachedBungieGlobalDisplayNameCode ?? "????"}`.padStart(4, "0");

			BaseComponent.create()
				.classes.add(PlayerOverviewClasses.Identity)
				.append(BaseComponent.create()
					.classes.add(PlayerOverviewClasses.IdentityUsername)
					.text.set(memberships.bungieNetUser.cachedBungieGlobalDisplayName))
				.append(BaseComponent.create()
					.classes.add(PlayerOverviewClasses.IdentityCode)
					.text.set(`#${this.code}`))
				.event.subscribe("click", () => this.drawer.open("click"))
				.appendTo(this);

			this.drawer = Drawer.create()
				.classes.add(PlayerOverviewClasses.Drawer)
				.appendTo(this);

			this.currencyOverview = InfoBlock.create()
				.appendTo(this.drawer);

			this.classSelection = BaseComponent.create()
				.classes.add(PlayerOverviewClasses.ClassSelection)
				.appendTo(this.drawer);

			this.characterPicker = (ClassPicker.create([]) as ClassPicker<CharacterId>)
				.classes.add(PlayerOverviewClasses.CharacterPicker)
				.event.subscribe("selectClass", event => {
					const panel = this.panels[event.option];
					if (!panel) {
						console.error(`Selected unknown option '${event.option}'`);
						return;
					}

					this.drawer.showPanel(this.panels[event.option]);
				})
				.appendTo(this.classSelection);

			this.statsOverview = InfoBlock.create()
				.appendTo(this.drawer);

			inventory.event.subscribe("update", this.update);
			inventory.event.subscribe("itemUpdate", this.update);
			this.update();

			this.event.subscribe("mouseenter", () => this.drawer.open("mouseenter"));
			this.event.subscribe("mouseleave", () => this.drawer.close("mouseenter"));

			document.body.addEventListener("click", this.onClick);

			UiEventBus.subscribe("keydown", this.onKeydown);
			UiEventBus.subscribe("keyup", this.onKeyup);

			viewManager.event.subscribe("show", () => this.drawer.close(true));

			this.drawer.event.subscribe("openDrawer", () => {
				if (inventory.sortedCharacters?.[0].characterId)
					void this.characterPicker.setCurrent(inventory.sortedCharacters?.[0].characterId as CharacterId);
			});
		}

		private previous?: Record<DestinyClass, string[]>;
		@Bound
		public update () {
			this.drawer.removePanels();
			this.panels = {};
			this.updateCharacters();
			this.statsOverview.appendTo(this.drawer);
			this.drawer.enable();
		}

		private updateCharacters () {
			const characters = (this.inventory.sortedCharacters ?? []).slice()
				// sort characters by active option so that the active option stays the visible panel
				.sort((a, b) => a.characterId === this.characterPicker.currentOption ? -1 : b.characterId === this.characterPicker.currentOption ? 1 : 0);
			if (!characters.length) {
				console.warn("No characters found");
				this.drawer.disable();
				return;
			}

			for (const character of characters) {
				const bucket = this.inventory.getCharacterBuckets(character.characterId as CharacterId);
				if (!bucket) {
					console.warn(`No bucket found for the character ${character.characterId}`);
					continue;
				}

				const panel = this.createPanel(character, bucket);
				this.panels[character.characterId as CharacterId] = panel;
				const className = character.class?.displayProperties.name ?? "Unknown";
				this.characterPicker.addOption({
					id: character.characterId as CharacterId,
					background: `https://www.bungie.net${character.emblem?.secondarySpecial ?? character.emblemBackgroundPath}`,
					icon: `https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_${className.toLowerCase()}.svg`,
				});
			}
		}

		private createPanel (character: Character, bucket: Bucket[]) {
			const panel = this.drawer.createPanel()
				.classes.add(PlayerOverviewClasses.Panel);

			const slotViews = [
				InventoryKineticView,
				InventoryEnergyView,
				InventoryPowerView,
				InventoryHelmetView,
				InventoryArmsView,
				InventoryChestView,
				InventoryLegsView,
				InventoryClassItemView,
			];
			const equippedItems: Partial<Record<InventoryBucketHashes | string, Item>> = {};
			const highestPowerItems: Partial<Record<InventoryBucketHashes | string, Item>> = {};
			for (const item of bucket.flatMap(bucket => bucket.items)) {
				const view = slotViews.find(view => item.definition.inventory?.bucketTypeHash === view.definition.slot);
				for (const slot of Arrays.resolve(view?.definition.slot)) {
					const id = IInventoryViewDefinition.resolveSlotId(slot);
					if (item.equipped)
						equippedItems[id] = item;

					const highestPower = highestPowerItems[id]?.instance?.primaryStat?.value ?? 0;
					const itemPower = item.instance?.primaryStat?.value ?? 0;
					if (itemPower > highestPower || (itemPower === highestPower && item.equipped))
						highestPowerItems[id] = item;
				}

			}

			const currentPower = Maths.average(...Object.values(equippedItems)
				.map(item => item?.instance?.primaryStat?.value ?? 0));

			const maximisedPower = Maths.average(...Object.values(highestPowerItems)
				.map(item => item?.instance?.primaryStat?.value ?? 0));

			const slotComponent = BaseComponent.create()
				.classes.add(PlayerOverviewClasses.Slot, PlayerOverviewClasses.OverviewSlot)
				.attributes.set("data-name", `${this.displayName}#${this.code}`)
				.appendTo(panel);

			BaseComponent.create()
				.text.add("Equipped")
				.classes.add(PlayerOverviewClasses.PowerTotalLabel, PlayerOverviewClasses.PowerTotalLabelEquipped)
				.appendTo(slotComponent);

			ItemPowerLevel.create([currentPower])
				.classes.add(PlayerOverviewClasses.Power, PlayerOverviewClasses.PowerTotal, PlayerOverviewClasses.PowerEquipped)
				.appendTo(slotComponent);

			BaseComponent.create()
				.text.add("Maximum Power")
				.classes.add(PlayerOverviewClasses.PowerTotalLabel, PlayerOverviewClasses.PowerTotalLabelHighestPower)
				.appendTo(slotComponent);

			ItemPowerLevel.create([maximisedPower])
				.classes.add(PlayerOverviewClasses.Power, PlayerOverviewClasses.PowerTotal, PlayerOverviewClasses.PowerHighestPower)
				.appendTo(slotComponent);

			const equippedLog: any[] = [];
			const highestPowerLog: any[] = [];
			this.previous ??= {} as any;
			const previous = this.previous![character.classType] ??= [];
			let i = 0;

			for (const view of slotViews) {
				for (const slot of Arrays.resolve(view.definition.slot)) {
					const id = IInventoryViewDefinition.resolveSlotId(slot);

					let name = view.definition.name ?? "Unknown View";
					if (typeof name === "function")
						name = name();

					const equippedItem = equippedItems[id];
					if (!equippedItem) {
						console.warn(`No equipped item for slot ${name}`);
						continue;
					}

					const slotComponent = BaseComponent.create()
						.classes.add(PlayerOverviewClasses.Slot)
						.attributes.set("data-name", name)
						.appendTo(panel);

					if (previous[i++] !== equippedItem.reference.itemInstanceId) {
						equippedLog.push(`\n    ${name}:`, equippedItem?.definition.displayProperties.name, equippedItem);
						previous[i - 1] = equippedItem.reference.itemInstanceId!;
					}

					ItemComponent.create([equippedItem])
						.classes.add(PlayerOverviewClasses.Item, PlayerOverviewClasses.ItemEquipped)
						.appendTo(slotComponent);

					const equippedPower = equippedItem.instance?.primaryStat?.value ?? 0;
					ItemPowerLevel.create([equippedPower, equippedPower - Math.floor(maximisedPower)])
						.classes.add(PlayerOverviewClasses.Power, PlayerOverviewClasses.PowerEquipped)
						.appendTo(slotComponent);

					const highestPowerItem = highestPowerItems[id];
					if (!highestPowerItem) {
						console.warn(`No highest power item for slot ${name}`);
						continue;
					}

					if (highestPowerItem === equippedItem) {
						BaseComponent.create()
							.classes.add(PlayerOverviewClasses.Item, PlayerOverviewClasses.ItemHighestPower, PlayerOverviewClasses.ItemSame)
							.appendTo(slotComponent);

						BaseComponent.create()
							.classes.add(PlayerOverviewClasses.Power, PlayerOverviewClasses.PowerHighestPower)
							.appendTo(slotComponent);
						continue;
					}

					if (previous[i++] !== highestPowerItem.reference.itemInstanceId) {
						highestPowerLog.push(`\n    ${name}:`, highestPowerItem?.definition.displayProperties.name, highestPowerItem);
						previous[i - 1] = highestPowerItem.reference.itemInstanceId!;
					}

					ItemComponent.create([highestPowerItem, this.inventory])
						.classes.add(PlayerOverviewClasses.Item, PlayerOverviewClasses.ItemHighestPower)
						.appendTo(slotComponent);

					const highestPowerPower = highestPowerItem.instance?.primaryStat?.value ?? 0;
					ItemPowerLevel.create([highestPowerPower, highestPowerPower - Math.floor(maximisedPower)])
						.classes.add(PlayerOverviewClasses.Power, PlayerOverviewClasses.PowerHighestPower)
						.appendTo(slotComponent);
				}
			}

			if (equippedLog.length || highestPowerLog.length)
				console.log(character.class.displayProperties.name,
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
					...!equippedLog.length ? [] : [`\n  Equipped Items - ${Math.floor(currentPower)}${currentPower % 1 ? ` ${(currentPower % 1) * 8}/8` : ""}`, ...equippedLog],
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
					...!highestPowerLog.length ? [] : [`\n\n  Highest Power Items - ${Math.floor(maximisedPower)}${maximisedPower % 1 ? ` ${(maximisedPower % 1) * 8}/8` : ""}`, ...highestPowerLog]
				);

			return panel;
		}

		@Bound
		private onClick (event: Event): void {
			if (!this.exists())
				return document.body.removeEventListener("click", this.onClick);

			if ((event.target as HTMLElement).closest(`.${PlayerOverviewClasses.Main}`))
				return;

			this.drawer.close(true);
		}

		@Bound
		private onKeydown (event: IKeyEvent) {
			if (!document.contains(this.element)) {
				UiEventBus.unsubscribe("keydown", this.onKeydown);
				return;
			}

			if ((event.use("c") || event.use("p") || event.use("o") || event.use("F1")) && this.drawer.toggle("key"))
				this.drawer.element.focus();

			if (this.drawer.isOpen() && event.useOverInput("Escape"))
				this.drawer.close(true);
		}

		@Bound
		private onKeyup (event: IKeyEvent) {
			if (!document.contains(this.element)) {
				UiEventBus.unsubscribe("keyup", this.onKeyup);
				return;
			}

			if (!this.element.contains(document.activeElement) && !event.matches("e"))
				this.drawer.close(true);
		}
	}


	export function create (): Loadable.Component {
		return Loadable.create(Memberships, Inventory.await())
			.onReady((memberships, inventory) => Component.create([memberships, inventory]))
			.setSimple()
			.classes.add(PlayerOverviewClasses.Container);
	}
}

export default PlayerOverview;

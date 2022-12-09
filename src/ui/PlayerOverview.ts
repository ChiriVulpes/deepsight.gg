import type { DestinyCharacterComponent, ItemCategoryHashes } from "bungie-api-ts/destiny2";
import type { UserMembershipData } from "bungie-api-ts/user";
import Inventory from "model/models/Inventory";
import type { Bucket } from "model/models/Items";
import type Item from "model/models/items/Item";
import type { CharacterId } from "model/models/items/Item";
import Memberships from "model/models/Memberships";
import BaseComponent from "ui/Component";
import { ButtonClasses } from "ui/form/Button";
import Drawer from "ui/form/Drawer";
import ItemComponent from "ui/inventory/Item";
import ItemPowerLevel from "ui/inventory/ItemPowerLevel";
import Loadable from "ui/Loadable";
import InventoryArmsView from "ui/view/inventory/InventoryArmsView";
import InventoryChestView from "ui/view/inventory/InventoryChestView";
import InventoryClassItemView from "ui/view/inventory/InventoryClassItemView";
import InventoryEnergyView from "ui/view/inventory/InventoryEnergyView";
import InventoryHelmetView from "ui/view/inventory/InventoryHelmetView";
import InventoryKineticView from "ui/view/inventory/InventoryKineticView";
import InventoryLegsView from "ui/view/inventory/InventoryLegsView";
import InventoryPowerView from "ui/view/inventory/InventoryPowerView";
import Maths from "utility/maths/Maths";

export enum PlayerOverviewClasses {
	Main = "player-overview",
	Container = "player-overview-container",
	Identity = "player-overview-identity",
	IdentityUsername = "player-overview-identity-username",
	IdentityCode = "player-overview-identity-code",
	Drawer = "player-overview-drawer",
	Panel = "player-overview-drawer-panel",
	Slot = "player-overview-slot",
	OverviewSlot = "player-overview-slot-overview",
	Item = "player-overview-item",
	Power = "player-overview-power",
}

namespace PlayerOverview {

	export class Component extends BaseComponent<HTMLElement, [UserMembershipData, Inventory]> {
		public drawer!: Drawer;
		private inventory!: Inventory;

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
				.event.subscribe("click", () => this.drawer.open())
				.appendTo(this);

			this.drawer = Drawer.create()
				.classes.add(PlayerOverviewClasses.Drawer)
				.appendTo(this);

			this.update();
		}

		public update () {
			this.drawer.removeContents();
			for (const character of this.inventory.sortedCharacters ?? []) {
				const bucket = this.inventory.buckets?.[character.characterId as CharacterId];
				if (!bucket) {
					console.warn(`No bucket found for the character ${character.characterId}`);
					continue;
				}

				this.createPanel(character, bucket);
			}
		}

		private createPanel (character: DestinyCharacterComponent, bucket: Bucket) {
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
			const equippedItems: Partial<Record<ItemCategoryHashes, Item>> = {};
			const highestPowerItems: Partial<Record<ItemCategoryHashes, Item>> = {};
			for (const item of bucket.items) {
				const view = slotViews.find(view => item.definition.itemCategoryHashes?.includes(view.definition.slot));
				if (!view)
					continue;

				if (item.equipped)
					equippedItems[view.definition.slot] = item;

				if ((item.instance?.primaryStat?.value ?? 0) > (highestPowerItems[view.definition.slot]?.instance?.primaryStat?.value ?? 0))
					highestPowerItems[view.definition.slot] = item;
			}

			const currentPower = Math.floor(Maths.average(...Object.values(equippedItems)
				.map(item => item.instance?.primaryStat?.value ?? 0)));

			const maximisedPower = Math.floor(Maths.average(...Object.values(highestPowerItems)
				.map(item => item.instance?.primaryStat?.value ?? 0)));

			const slotComponent = BaseComponent.create()
				.classes.add(PlayerOverviewClasses.Slot, PlayerOverviewClasses.OverviewSlot)
				.attributes.set("data-name", `${this.displayName}#${this.code}`)
				.appendTo(panel);

			ItemPowerLevel.create([currentPower])
				.classes.add(PlayerOverviewClasses.Power)
				.appendTo(slotComponent);

			ItemPowerLevel.create([maximisedPower])
				.classes.add(PlayerOverviewClasses.Power)
				.appendTo(slotComponent);

			for (const view of slotViews) {
				let name = view.definition.name;
				if (typeof name === "function")
					name = name();

				const equippedItem = equippedItems[view.definition.slot];
				if (!equippedItem) {
					console.warn(`No equipped item for slot ${name}`);
					continue;
				}

				const slotComponent = BaseComponent.create()
					.classes.add(PlayerOverviewClasses.Slot)
					.attributes.set("data-name", name)
					.appendTo(panel);

				console.log(`Equipped to ${name}:`, equippedItem?.definition.displayProperties.name, equippedItem);
				ItemComponent.create([equippedItem])
					.classes.remove(ButtonClasses.Main)
					.classes.add(PlayerOverviewClasses.Item)
					.appendTo(slotComponent);

				const equippedPower = equippedItem.instance?.primaryStat.value ?? 0;
				ItemPowerLevel.create([equippedPower, equippedPower - maximisedPower])
					.classes.add(PlayerOverviewClasses.Power)
					.appendTo(slotComponent);

				const highestPowerItem = highestPowerItems[view.definition.slot];
				if (!highestPowerItem) {
					console.warn(`No highest power item for slot ${name}`);
					continue;
				}

				if (highestPowerItem === equippedItem)
					continue;

				console.log(`Highest power in ${name}:`, highestPowerItem?.definition.displayProperties.name, highestPowerItem);
				ItemComponent.create([highestPowerItem, this.inventory])
					.classes.add(PlayerOverviewClasses.Item)
					.appendTo(slotComponent);

				const highestPowerPower = highestPowerItem.instance?.primaryStat.value ?? 0;
				ItemPowerLevel.create([highestPowerPower, highestPowerPower - maximisedPower])
					.classes.add(PlayerOverviewClasses.Power)
					.appendTo(slotComponent);
			}
		}
	}


	export function create () {
		return Loadable.create(Memberships, Inventory.createTemporary())
			.onReady((memberships, inventory) => Component.create([memberships, inventory]))
			.setSimple()
			.classes.add(PlayerOverviewClasses.Container);
	}
}

export default PlayerOverview;

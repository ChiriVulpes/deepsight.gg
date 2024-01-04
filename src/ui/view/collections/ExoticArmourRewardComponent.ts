import { InventoryItemHashes } from "@deepsight.gg/enums";
import type { DestinyItemComponent } from "bungie-api-ts/destiny2";
import { ItemState } from "bungie-api-ts/destiny2";
import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type LoadedIcon from "ui/bungie/LoadedIcon";
import ItemComponent from "ui/inventory/ItemComponent";
import type { Mutable } from "utility/Type";

export enum ExoticArmourRewardComponentClasses {
	Main = "item-exotic-armour-reward",
}

const paths: Partial<Record<InventoryItemHashes, string>> = {
	[InventoryItemHashes.IfSoloExoticChestArmorRareDummy]: "./image/png/item/chest.png",
	[InventoryItemHashes.IfSoloExoticHeadArmorRareDummy]: "./image/png/item/head.png",
	[InventoryItemHashes.IfSoloExoticLegsArmorRareDummy]: "./image/png/item/legs.png",
	[InventoryItemHashes.IfSoloExoticArmsArmorRareDummy]: "./image/png/item/arms.png",
};

export default class ExoticArmourRewardComponent extends ItemComponent {

	public static is (item: Item) {
		return item.definition.hash in paths;
	}

	protected override async onMake (item: Item, inventory?: Inventory | undefined) {
		(item.reference as Mutable<DestinyItemComponent>).state = ItemState.Masterwork;
		await super.onMake(item, inventory);
		this.classes.add(ExoticArmourRewardComponentClasses.Main);
		this.clearTooltip();
	}

	protected override initialiseIcon (icon: LoadedIcon) {
		const path = paths[this.item.definition.hash as InventoryItemHashes];
		if (path) {
			icon.setPath(path);
		}
	}
}

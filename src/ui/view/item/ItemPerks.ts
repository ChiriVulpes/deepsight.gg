import { PlugType } from "model/models/items/Plugs";
import ItemSockets from "ui/view/item/ItemSockets";

export enum ItemPerksClasses {
}

export default class ItemPerks extends ItemSockets {
	protected getTitle () {
		return "Weapon Perks";
	}

	protected override initialise () {
		this.addSocketsByPlugType(PlugType.Perk);
	}
}

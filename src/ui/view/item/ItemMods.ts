import { PlugType } from "model/models/items/Plugs";
import ItemSockets from "ui/view/item/ItemSockets";

// export enum ItemModsClasses {
// 	Mod = "view-item-socket-plug-mod",
// }

export default class ItemMods extends ItemSockets {
	protected getTitle () {
		return "Weapon Mods";
	}

	protected override initialise () {
		this.addSocketsByType(PlugType.Mod);
	}
}

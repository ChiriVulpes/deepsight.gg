import { PlugType } from "model/models/items/Plugs";
import ItemSockets from "ui/view/item/ItemSockets";

export enum ItemIntrinsicsClasses {
	IntrinsicSocket = "view-item-socket-intrinsic",
}

export default class ItemIntrinsics extends ItemSockets {

	protected getTitle () {
		return "Intrinsic Traits";
	}

	protected override get socketClasses () { return [ItemIntrinsicsClasses.IntrinsicSocket]; }

	protected initialise () {
		this.addSocketsByPlugType(PlugType.Intrinsic);
		this.addSocketsByPlugType(PlugType.Origin);
		this.addPerksByPlugType(PlugType.Catalyst);
	}
}
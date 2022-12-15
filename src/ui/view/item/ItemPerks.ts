import { PlugType } from "model/models/items/Plugs";
import ItemSockets from "ui/view/item/ItemSockets";

export enum ItemPerksClasses {
	// Perk = "view-item-socket-plug-perk",
	PerkEnhanced = "view-item-socket-plug-perk-enhanced",
}

export default class ItemPerks extends ItemSockets {
	protected getTitle () {
		return "Weapon Perks";
	}

	protected override addSockets () {
		let i = 0;
		for (const socket of this.item.getSockets(PlugType.Perk)) {
			const socketComponent = this.addSocket()
				.classes.toggle(socket.socketedPlug.is(PlugType.Enhanced), ItemPerksClasses.PerkEnhanced)
				.style.set("--socket-index", `${i++}`);

			for (const plug of socket.plugs)
				socketComponent.addPlug(plug);
		}
	}
}

import ItemSockets from "ui/view/item/ItemSockets";

// export enum ItemModsClasses {
// 	Mod = "view-item-socket-plug-mod",
// }

export default class ItemMods extends ItemSockets {
	protected getTitle () {
		return "Weapon Mods";
	}

	protected override addSockets () {
		let i = 0;
		for (const socket of (this.item.sockets ?? [])) {
			if (!socket?.plugs.some(plug => plug.definition?.itemTypeDisplayName === "Weapon Mod"))
				continue;

			const socketComponent = this.addSocket()
				.style.set("--socket-index", `${i++}`);

			for (const plug of socket.plugs)
				socketComponent.addPlug(plug);
		}
	}
}

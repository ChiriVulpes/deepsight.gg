import Display from "ui/bungie/DisplayProperties";
import ItemSockets, { ItemSocketsClasses } from "ui/view/item/ItemSockets";

export enum ItemIntrinsicsClasses {
	IntrinsicSocket = "view-item-socket-intrinsic",
}

export default class ItemIntrinsics extends ItemSockets {

	protected getTitle () {
		return "Intrinsic Traits";
	}

	protected addSockets () {
		for (const socket of this.item.sockets?.filter(socket => socket?.definition.plug?.plugCategoryIdentifier === "intrinsics" && Display.name(socket.definition)) ?? []) {
			this.addSocket()
				.classes.add(ItemIntrinsicsClasses.IntrinsicSocket)
				.addOption()
				.classes.add(ItemSocketsClasses.Socketed)
				.setIcon(Display.icon(socket?.definition))
				.setName(Display.name(socket?.definition))
				.setDescription(Display.description(socket?.definition));
		}

		for (const socket of this.item.plugs?.filter(socket => socket.some(plug => plug.definition?.plug?.plugCategoryIdentifier === "origins")) ?? []) {
			const socketComponent = this.addSocket()
				.classes.add(ItemIntrinsicsClasses.IntrinsicSocket);

			for (const plug of socket)
				socketComponent.addOption(plug);
		}
	}
}
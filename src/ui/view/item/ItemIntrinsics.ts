import { ItemPerkVisibility } from "bungie-api-ts/destiny2";
import { PlugType } from "model/models/items/Plugs";
import Display from "ui/bungie/DisplayProperties";
import ItemPlugTooltip from "ui/inventory/ItemPlugTooltip";
import ItemSockets, { ItemSocketsClasses } from "ui/view/item/ItemSockets";

export enum ItemIntrinsicsClasses {
	IntrinsicSocket = "view-item-socket-intrinsic",
}

export default class ItemIntrinsics extends ItemSockets {

	protected getTitle () {
		return "Intrinsic Traits";
	}

	protected addSockets () {
		for (const socket of this.item.getSockets(PlugType.Intrinsic)) {
			if (!socket.isVisible)
				continue;

			this.addSocket()
				.classes.add(ItemIntrinsicsClasses.IntrinsicSocket)
				.addPlug()
				.classes.add(ItemSocketsClasses.Socketed)
				.setIcon(Display.icon(socket.socketedPlug.definition))
				.setName(Display.name(socket.socketedPlug.definition))
				.setDescription(Display.description(socket.socketedPlug.definition))
				.setTooltip(ItemPlugTooltip, {
					// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
					initialiser: tooltip => tooltip.setPlug(socket.socketedPlug),
					differs: tooltip => tooltip.plug?.plugItemHash !== socket.socketedPlug.plugItemHash,
				});
		}

		for (const socket of this.item.getSockets(PlugType.Origin)) {
			const socketComponent = this.addSocket()
				.classes.add(ItemIntrinsicsClasses.IntrinsicSocket);

			for (const plug of socket.plugs)
				socketComponent.addPlug(plug);
		}

		for (const socket of this.item.getSockets(PlugType.Catalyst))
			for (const plug of socket.plugs)
				for (const perk of plug.perks) {
					if (perk.perkVisibility === ItemPerkVisibility.Hidden || !perk.definition.isDisplayable)
						continue;

					const socketComponent = this.addSocket()
						.classes.add(ItemIntrinsicsClasses.IntrinsicSocket);

					socketComponent.addPlug(plug, perk);
				}
	}
}
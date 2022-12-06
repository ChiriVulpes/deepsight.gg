import { ITEM_WEAPON_MOD } from "model/models/Items";
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
		for (const socket of (this.item.plugs ?? [])) {
			const isValidSocket = socket.some(plug =>
				// filter out different socket types (a shader or something)
				plug.definition?.itemCategoryHashes?.some(hash => hash === ITEM_WEAPON_MOD)
				|| plug.definition?.plug?.plugCategoryIdentifier === "frames");

			const isInvalidSocket = !isValidSocket || socket.some(plug =>
				plug.definition?.plug?.plugCategoryIdentifier === "intrinsics"
				|| plug.definition?.itemTypeDisplayName === "Weapon Mod"
				|| plug.definition?.plug?.plugCategoryIdentifier === "origins"
				|| plug.definition?.plug?.plugCategoryIdentifier === "v400.weapon.mod_empty"
				|| plug.definition?.traitIds?.includes("item_type.ornament.weapon"));
			if (isInvalidSocket)
				continue;

			const socketComponent = this.addSocket()
				.classes.toggle(socket.some(plug => plug.definition?.itemTypeDisplayName === "Enhanced Trait"), ItemPerksClasses.PerkEnhanced)
				.style.set("--socket-index", `${i++}`);

			for (const plug of socket)
				socketComponent.addOption(plug);
		}
	}
}

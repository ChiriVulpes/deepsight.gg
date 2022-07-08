import { DestinyAmmunitionType } from "bungie-api-ts/destiny2";
import Component from "ui/Component";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.AmmoType,
	name: "Ammo Type",
	shortName: "Ammo",
	sort: (a, b) =>
		(a.definition.equippingBlock?.ammoType ?? DestinyAmmunitionType.None) - (b.definition.equippingBlock?.ammoType ?? DestinyAmmunitionType.None),
	render: item => {
		const ammoType = item.definition.equippingBlock?.ammoType;
		if (!ammoType)
			return undefined;

		return Component.create()
			.classes.add("item-ammo-type", `item-ammo-type-${ammoType === DestinyAmmunitionType.Primary ? "primary" : ammoType === DestinyAmmunitionType.Special ? "special" : "heavy"}`);
	},
});

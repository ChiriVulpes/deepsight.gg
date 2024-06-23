import { DestinyAmmunitionType } from "bungie-api-ts/destiny2";
import AmmoTypes from "model/models/enum/AmmoTypes";
import EnumIcon from "ui/destiny/component/EnumIcon";
import Sort, { ISort } from "ui/destiny/sort/Sort";

export default ISort.create({
	id: Sort.AmmoType,
	name: "Ammo Type",
	shortName: "Ammo",
	sort: (a, b) =>
		(a.definition.equippingBlock?.ammoType ?? DestinyAmmunitionType.None) - (b.definition.equippingBlock?.ammoType ?? DestinyAmmunitionType.None),
	renderSortable: sortable => sortable.icon,
	render: item => !item.definition.equippingBlock?.ammoType ? undefined
		: EnumIcon.create([AmmoTypes, item.definition.equippingBlock?.ammoType])
			.classes.add("item-sort-ammo-type"),
});

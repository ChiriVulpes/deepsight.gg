import { DamageType } from "bungie-api-ts/destiny2";
import DamageTypes from "model/models/enum/DamageTypes";
import EnumIcon from "ui/destiny/component/EnumIcon";
import Sort, { ISort } from "ui/destiny/sort/Sort";

export default ISort.create({
	id: Sort.DamageType,
	name: "Damage Type",
	shortName: "Damage",
	sort: (a, b) => (b.getDamageType() ?? DamageType.None) - (a.getDamageType() ?? DamageType.None),
	renderSortable: sortable => sortable.icon
		.tweak(EnumIcon.applyIconVar, DamageTypes, DamageType.Kinetic),
	render: (item, damageType = item.getDamageType()) => !damageType ? undefined
		: EnumIcon.create([DamageTypes, damageType])
			.classes.add("item-sort-damage-type"),
});

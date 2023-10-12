import { DamageType } from "bungie-api-ts/destiny2";
import DamageTypes from "model/models/enum/DamageTypes";
import EnumIcon from "ui/bungie/EnumIcon";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.DamageType,
	name: "Damage Type",
	sort: (a, b) => (b.instance?.damageType ?? DamageType.None) - (a.instance?.damageType ?? DamageType.None),
	render: item => EnumIcon.create([DamageTypes, item.instance?.damageTypeHash])
		.classes.add("item-sort-damage-type"),
});

import Component from "ui/Component";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.WeaponType,
	name: "Weapon Type",
	shortName: "Ammo",
	sort: (a, b) => a.definition.itemTypeDisplayName.localeCompare(b.definition.itemTypeDisplayName),
	render: item => Component.create()
		.classes.add("item-name")
		.text.set(`${item.definition.itemTypeDisplayName}`),
});

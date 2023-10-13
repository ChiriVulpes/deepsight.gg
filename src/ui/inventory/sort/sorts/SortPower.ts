import ItemPowerLevel, { ItemPowerLevelClasses } from "ui/inventory/ItemPowerLevel";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Power,
	name: "Power",
	sort: (a, b) => b.getPower() - a.getPower(),
	renderSortable: sortable => sortable.icon.classes.add(ItemPowerLevelClasses.Icon),
	render: item => {
		const power = item.getPower();
		if (!power)
			return undefined;

		return ItemPowerLevel.create([power]);
	},
});

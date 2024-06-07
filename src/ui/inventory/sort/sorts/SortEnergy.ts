import Component from "ui/Component";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Energy,
	name: "Energy",
	sort: (a, b) => (b.instance?.energy?.energyCapacity ?? 0) - (a.instance?.energy?.energyCapacity ?? 0),
	renderSortable: sortable => sortable.icon,
	render: item => {
		if (!item.instance?.energy?.energyCapacity)
			return undefined;

		return Component.create("span")
			.classes.add("item-energy")
			.append(Component.create("span")
				.classes.add("item-energy-icon"))
			.text.set(`${item.instance?.energy?.energyCapacity ?? 0}`);
	},
});

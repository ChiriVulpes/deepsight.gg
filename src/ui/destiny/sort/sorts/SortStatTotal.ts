import type Item from "model/models/items/Item";
import Component from "ui/component/Component";
import Sort, { ISort } from "ui/destiny/sort/Sort";
import { ARMOUR_STAT_GROUPS } from "ui/destiny/utility/Stat";

export default ISort.create({
	id: Sort.StatTotal,
	name: "Stat Total",
	sort: (a, b) => getStatTotal(b) - getStatTotal(a),
	renderSortable: sortable => sortable.icon,
	render: item => {
		const total = getStatTotal(item);
		if (!total)
			return undefined;

		return Component.create("span")
			.classes.add("item-sort-stat-total")
			.append(Component.create("span")
				.classes.add("item-sort-stat-total-icon"))
			.text.set(`${getStatTotal(item)}`);
	},
});

function getStatTotal (item: Item) {
	return ARMOUR_STAT_GROUPS.flat().map(stat => item.stats?.values[stat]?.intrinsic ?? 0)
		.reduce((a, b) => a + b, 0);
}

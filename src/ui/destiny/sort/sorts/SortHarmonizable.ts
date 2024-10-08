import type Item from "model/models/items/Item";
import Component from "ui/component/Component";
import Sort, { ISort } from "ui/destiny/sort/Sort";

export default ISort.create({
	id: Sort.Harmonizable,
	name: "Deepsight Harmonizer",
	shortName: "Harmonizer",
	renderSortable: sortable => sortable.icon,
	render: item => {
		if (!item.deepsight?.activation)
			return undefined;

		return Component.create("span")
			.classes.add("item-sort-harmonizable")
			.append(Component.create("span")
				.classes.add("item-sort-harmonizable-icon"))
			.append(Component.create("span")
				.classes.add("item-sort-harmonizable-numerator")
				.text.set(`${item.deepsight?.pattern?.progress?.progress ?? 0}`))
			.append(Component.create("span")
				.classes.add("item-sort-harmonizable-separator")
				.text.set("/"))
			.append(Component.create("span")
				.classes.add("item-sort-harmonizable-denominator")
				.text.set(`${item.deepsight?.pattern?.progress?.completionValue}`));
	},
	sort: (a, b) => getSortIndex(b) - getSortIndex(a),
});

function getSortIndex (item: Item) {
	return Number(!!item.deepsight?.activation && (item.deepsight?.pattern?.progress?.progress ?? 0) + 1);
}

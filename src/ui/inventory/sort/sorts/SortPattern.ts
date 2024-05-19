import Component from "ui/Component";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Pattern,
	name: "Pattern",
	sort: (a, b) => Number(b.hasPattern()) - Number(a.hasPattern()),
	renderSortable: sortable => sortable.icon,
	render: item => {
		if (!item.bucket.isCollections() || !item.hasPattern())
			return undefined;

		return Component.create()
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
});


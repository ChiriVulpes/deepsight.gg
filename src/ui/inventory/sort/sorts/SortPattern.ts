import Component from "ui/Component";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Pattern,
	name: "Pattern",
	sort: (a, b) => 0
		|| Number(b.hasPattern()) - Number(a.hasPattern())
		|| (!b.hasPattern() ? 0 : b.deepsight?.pattern?.progress?.progress ?? 0) - (!a.hasPattern() ? 0 : a.deepsight?.pattern?.progress?.progress ?? 0),
	renderSortable: sortable => sortable.icon,
	render: item => {
		if (!item.bucket.isCollections() || !item.hasPattern())
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
});


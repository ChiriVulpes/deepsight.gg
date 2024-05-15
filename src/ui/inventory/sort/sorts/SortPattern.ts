import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Pattern,
	name: "Pattern",
	sort: (a, b) => Number(b.hasPattern()) - Number(a.hasPattern()),
	renderSortable: sortable => sortable.icon,
});


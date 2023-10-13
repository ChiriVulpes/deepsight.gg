import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Pattern,
	name: "Gives Pattern Progress",
	shortName: "Pattern",
	sort: (a, b) => Number(b.hasPattern()) - Number(a.hasPattern()),
	renderSortable: sortable => sortable.icon,
});


import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Masterwork,
	name: "Masterwork",
	renderSortable: sortable => sortable.icon,
	sort: (a, b) => Number(!!b.isMasterwork()) - Number(!!a.isMasterwork()),
});

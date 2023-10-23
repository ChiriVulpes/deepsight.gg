import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Moment,
	name: "Moment",
	renderSortable: sortable => sortable.icon,
	sort: (a, b) => (b.moment?.hash ?? -1) - (a.moment?.hash ?? -1),
});

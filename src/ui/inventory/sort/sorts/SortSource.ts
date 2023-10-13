import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Source,
	name: "Source",
	renderSortable: sortable => sortable.icon,
	sort: (a, b) => (b.source?.hash ?? -1) - (a.source?.hash ?? -1),
});

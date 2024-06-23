import Sort, { ISort } from "ui/destiny/sort/Sort";

export default ISort.create({
	id: Sort.CanShape,
	name: "Can Shape",
	renderSortable: sortable => sortable.icon,
	sort: (a, b) => +b.canShape() - +a.canShape(),
});

import Sort, { ISort } from "ui/destiny/sort/Sort";

export default ISort.create({
	id: Sort.Featured,
	name: "Featured",
	sort: (a, b) => Number(!!b.definition.isFeaturedItem) - Number(!!a.definition.isFeaturedItem),
	renderSortable: sortable => sortable.icon,
});

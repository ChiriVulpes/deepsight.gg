import Sort, { ISort } from "ui/destiny/sort/Sort";

export default ISort.create({
	id: Sort.Locked,
	name: "Locked",
	sort: (a, b) => Number(!!b.isLocked()) - Number(!!a.isLocked()),
	renderSortable: sortable => sortable.icon,
});

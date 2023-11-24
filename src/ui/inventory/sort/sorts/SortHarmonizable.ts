import type Item from "model/models/items/Item";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Harmonizable,
	name: "Deepsight Activation",
	shortName: "Activation",
	renderSortable: sortable => sortable.icon,
	sort: (a, b) => getSortIndex(b) - getSortIndex(a),
});

function getSortIndex (item: Item) {
	return Number(!!item.deepsight?.activation);
}

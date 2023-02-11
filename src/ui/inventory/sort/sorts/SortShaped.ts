import type Item from "model/models/items/Item";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Shaped,
	name: "Shaped",
	sort: (a, b) => getSortIndex(b) - getSortIndex(a),
});

function getSortIndex (item: Item) {
	return Number(!!item.shaped) * 10000000
		+ (item.shaped?.level?.progress.progress ?? 0) * 10000
		+ (item.shaped?.progress?.progress.progress ?? 0);
}

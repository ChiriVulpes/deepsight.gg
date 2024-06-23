import type Item from "model/models/items/Item";
import Sort, { ISort } from "ui/destiny/sort/Sort";

export default ISort.create({
	id: Sort.Shaped,
	name: "Shaped",
	renderSortable: sortable => sortable.icon,
	sort: (a, b) => getSortIndex(b) - getSortIndex(a),
});

function getSortIndex (item: Item) {
	if (item.bucket.isCollections())
		return item.hasShapedCopy() ? 1 : 0;

	return Number(!!item.shaped) * 10000000
		+ (item.shaped?.level?.progress.progress ?? 0) * 10000
		+ (item.shaped?.progress?.progress.progress ?? 0);
}

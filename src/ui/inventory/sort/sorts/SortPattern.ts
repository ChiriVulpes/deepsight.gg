import type Item from "model/models/items/Item";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Pattern,
	name: "Pattern",
	sort: (a, b) => Number(hasPattern(b)) - Number(hasPattern(a)),
});

function hasPattern (item: Item) {
	return !!(item.deepsight?.attunement && item.deepsight?.pattern && !item.deepsight.pattern.progress.complete);
}

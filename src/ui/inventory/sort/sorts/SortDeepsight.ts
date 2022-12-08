import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Deepsight,
	name: "Deepsight",
	sort: (a, b) => Number(b.hasDeepsight()) - Number(a.hasDeepsight()),
});

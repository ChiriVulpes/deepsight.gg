import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Source,
	name: "Source",
	sort: (a, b) => (b.source?.hash ?? -1) - (a.source?.hash ?? -1),
});

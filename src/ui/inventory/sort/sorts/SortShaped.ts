import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Shaped,
	name: "Shaped",
	sort: (a, b) => Number(!!b.shaped) - Number(!!a.shaped),
});

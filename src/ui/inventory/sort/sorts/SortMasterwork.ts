import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Masterwork,
	name: "Masterwork",
	sort: (a, b) => Number(!!b.isMasterwork()) - Number(!!a.isMasterwork()),
});

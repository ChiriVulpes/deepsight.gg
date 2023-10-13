import Component from "ui/Component";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Quantity,
	name: "Quantity",
	sort: (a, b) => b.reference.quantity - a.reference.quantity,
	renderSortable: sortable => sortable.icon,
	render: item => !(item.reference.quantity > 1) ? undefined : Component.create("span")
		.classes.add("item-quantity")
		.classes.toggle(item.reference.quantity >= (item.definition.inventory?.maxStackSize ?? Infinity), "item-quantity-max")
		.text.set(`x${item.reference.quantity.toLocaleString()}`),
});

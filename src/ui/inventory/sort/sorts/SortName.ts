import Component from "ui/Component";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Name,
	name: "Name",
	sort: (a, b) => a.definition.displayProperties.name.localeCompare(b.definition.displayProperties.name),
	render: item => Component.create()
		.classes.add("item-name")
		.text.set(`${item.definition.displayProperties.name}`),
});

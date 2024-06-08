import type Item from "model/models/items/Item";
import type { Plug } from "model/models/items/Plugs";
import Component from "ui/Component";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create<Item | Plug>({
	id: Sort.Name,
	name: "Name",
	sort: (a, b) => a.definition?.displayProperties.name.localeCompare(b.definition?.displayProperties.name ?? "") ?? 0,
	renderSortable: sortable => sortable.icon,
	render: (item: Partial<Item> & Partial<Plug>) => item.bucket?.isPostmaster() ? undefined : Component.create()
		.classes.add("item-name")
		.append(Component.create("span")
			.classes.add("item-name-text")
			.text.set(`${item.definition?.displayProperties.name}`)),
});

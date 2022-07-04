import Component from "ui/Component";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Power,
	name: "Power",
	sort: (a, b) => (b.instance?.primaryStat?.value ?? 0) - (a.instance?.primaryStat?.value ?? 0),
	render: item => Component.create()
		.classes.add("item-power-level")
		.append(Component.create().classes.add("item-power-level-icon"))
		.text.add(`${item.instance?.primaryStat.value ?? "N/A"}`),
});

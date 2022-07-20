import Component from "ui/Component";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Power,
	name: "Power",
	sort: (a, b) => b.getPower() - a.getPower(),
	render: item => {
		const power = item.getPower();
		if (!power)
			return undefined;

		return Component.create()
			.classes.add("item-power-level")
			.append(Component.create().classes.add("item-power-level-icon"))
			.text.add(`${power}`)
	},
});

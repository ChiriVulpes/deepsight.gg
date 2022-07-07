import Sort from "ui/inventory/sort/Sort";
import SortManager from "ui/inventory/sort/SortManager";
import InventoryArmourView from "ui/view/inventory/InventoryArmourView";

export default InventoryArmourView.create({
	id: "class-item",
	name: "Class Item",
	slot: slots => slots.byName("ClassItems"),
	sort: new SortManager({
		id: "class-items",
		name: "Class Items",
		default: [Sort.Power, Sort.Name, Sort.Energy],
		inapplicable: [Sort.Deepsight, Sort.Pattern, Sort.StatDistribution, Sort.StatTotal],
	}),
});

import FilterManager from "ui/inventory/filter/FilterManager";
import Sort from "ui/inventory/sort/Sort";
import SortManager from "ui/inventory/sort/SortManager";
import InventorySlotView from "ui/view/inventory/InventorySlotView";

export default InventorySlotView.clone().configure({
	sort: new SortManager({
		id: "weapons",
		name: "Weapons",
		default: [Sort.Pattern, Sort.Power, Sort.Name],
		inapplicable: [Sort.Energy, Sort.StatTotal, Sort.StatDistribution],
	}),
	filter: new FilterManager({
		id: "weapons",
		name: "Weapons",
		inapplicable: [],
	}),
});

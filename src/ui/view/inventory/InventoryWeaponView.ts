import Sort from "ui/inventory/sort/Sort";
import SortManager from "ui/inventory/SortManager";
import InventorySlotView from "ui/view/inventory/InventorySlotView";

export default InventorySlotView.clone().configure({
	inapplicableSorts: [Sort.Energy],
	sort: new SortManager({
		id: "weapons",
		name: "Weapons",
		default: [Sort.Pattern, Sort.Power, Sort.Name],
	}),
});

import Sort from "ui/inventory/sort/Sort";
import SortManager from "ui/inventory/SortManager";
import InventorySlotView from "ui/view/inventory/InventorySlotView";

export default InventorySlotView.clone().configure({
	inapplicableSorts: [Sort.Deepsight, Sort.Pattern],
	sort: new SortManager({
		id: "armour",
		name: "Armour",
		default: [Sort.Power, Sort.Name, Sort.Energy],
	}),
});

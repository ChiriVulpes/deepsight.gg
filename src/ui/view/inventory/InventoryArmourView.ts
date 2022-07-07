import Filter from "ui/inventory/filter/Filter";
import FilterManager from "ui/inventory/filter/FilterManager";
import Sort from "ui/inventory/sort/Sort";
import SortManager from "ui/inventory/sort/SortManager";
import InventorySlotView from "ui/view/inventory/InventorySlotView";

export default InventorySlotView.clone().configure({
	sort: new SortManager({
		id: "armour",
		name: "Armour",
		default: [Sort.Power, Sort.Name, Sort.Energy],
		inapplicable: [Sort.Deepsight, Sort.Pattern],
	}),
	filter: new FilterManager({
		id: "armour",
		name: "Armour",
		inapplicable: [Filter.Ammo, Filter.WeaponType, Filter.Perk],
	}),
});

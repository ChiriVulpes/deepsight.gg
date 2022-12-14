import Filter from "ui/inventory/filter/Filter";
import FilterManager from "ui/inventory/filter/FilterManager";
import Sort from "ui/inventory/sort/Sort";
import SortManager from "ui/inventory/sort/SortManager";
import InventorySlotView from "ui/view/inventory/InventorySlotView";

export const SORTS_INAPPLICABLE_ARMOUR = [Sort.Deepsight, Sort.Pattern, Sort.AmmoType, Sort.Shaped] as const;
export const SORTS_DEFAULT_ARMOUR = [Sort.Power, Sort.Name, Sort.Energy] as const;
export const FILTERS_INAPPLICABLE_ARMOUR = [Filter.Ammo, Filter.WeaponType, Filter.Perk] as const;

export default InventorySlotView.clone().configure({
	sort: new SortManager({
		id: "armour",
		name: "Armour",
		default: SORTS_DEFAULT_ARMOUR,
		inapplicable: SORTS_INAPPLICABLE_ARMOUR,
	}),
	filter: new FilterManager({
		id: "armour",
		name: "Armour",
		inapplicable: FILTERS_INAPPLICABLE_ARMOUR,
	}),
	separateVaults: true,
});

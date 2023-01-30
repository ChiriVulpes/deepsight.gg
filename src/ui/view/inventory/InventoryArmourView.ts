import Filter from "ui/inventory/filter/Filter";
import type { IFilterManagerConfiguration } from "ui/inventory/filter/FilterManager";
import FilterManager from "ui/inventory/filter/FilterManager";
import Sort from "ui/inventory/sort/Sort";
import type { ISortManagerConfiguration } from "ui/inventory/sort/SortManager";
import SortManager from "ui/inventory/sort/SortManager";
import InventorySlotView from "ui/view/inventory/InventorySlotView";
import Store from "utility/Store";

export const SORTS_INAPPLICABLE_ARMOUR = [Sort.Deepsight, Sort.Pattern, Sort.AmmoType, Sort.Shaped] as const;
export const SORTS_DEFAULT_ARMOUR = [Sort.Power, Sort.Name, Sort.Energy] as const;
export const FILTERS_INAPPLICABLE_ARMOUR = [Filter.Ammo, Filter.WeaponType, Filter.Perk, Filter.Shaped] as const;

export const SORT_MANAGER_ARMOUR_DEFINITION: ISortManagerConfiguration = {
	id: "armour",
	name: "Armour",
	default: SORTS_DEFAULT_ARMOUR,
	inapplicable: SORTS_INAPPLICABLE_ARMOUR,
};

export const FILTER_MANAGER_ARMOUR_DEFINITION: IFilterManagerConfiguration = {
	id: "armour",
	name: "Armour",
	inapplicable: FILTERS_INAPPLICABLE_ARMOUR,
};

export default InventorySlotView.clone().configure({
	sort: new SortManager(SORT_MANAGER_ARMOUR_DEFINITION),
	filter: new FilterManager(FILTER_MANAGER_ARMOUR_DEFINITION),
	separateVaults: true,
	displayDestinationButton: () => !Store.items.settingsEquipmentView,
});

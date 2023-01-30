import type { IFilterManagerConfiguration } from "ui/inventory/filter/FilterManager";
import FilterManager from "ui/inventory/filter/FilterManager";
import Sort from "ui/inventory/sort/Sort";
import type { ISortManagerConfiguration } from "ui/inventory/sort/SortManager";
import SortManager from "ui/inventory/sort/SortManager";
import InventorySlotView from "ui/view/inventory/InventorySlotView";
import Store from "utility/Store";

export const SORTS_DEFAULT_WEAPONS = [Sort.Pattern, Sort.Power, Sort.Name] as const;
export const SORTS_INAPPLICABLE_WEAPONS = [Sort.Energy, Sort.StatTotal, Sort.StatDistribution] as const;
export const FILTERS_INAPPLICABLE_WEAPONS = [] as const;

export const SORT_MANAGER_WEAPONS_DEFINITION: ISortManagerConfiguration = {
	id: "weapons",
	name: "Weapons",
	default: SORTS_DEFAULT_WEAPONS,
	inapplicable: SORTS_INAPPLICABLE_WEAPONS,
};

export const FILTER_MANAGER_WEAPONS_DEFINITION: IFilterManagerConfiguration = {
	id: "weapons",
	name: "Weapons",
	inapplicable: FILTERS_INAPPLICABLE_WEAPONS,
};

export default InventorySlotView.clone().configure({
	sort: new SortManager(SORT_MANAGER_WEAPONS_DEFINITION),
	filter: new FilterManager(FILTER_MANAGER_WEAPONS_DEFINITION),
	displayDestinationButton: () => !Store.items.settingsEquipmentView,
});

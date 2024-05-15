import Filter from "ui/inventory/filter/Filter";
import type { IFilterManagerConfiguration } from "ui/inventory/filter/FilterManager";
import FilterManager from "ui/inventory/filter/FilterManager";
import Sort from "ui/inventory/sort/Sort";
import type { ISortManagerConfiguration } from "ui/inventory/sort/SortManager";
import SortManager from "ui/inventory/sort/SortManager";
import InventorySlotView from "ui/view/inventory/slot/InventorySlotView";

export const SORTS_DEFAULT_EQUIPMENT = [Sort.Rarity, Sort.Masterwork, Sort.Name] as const;
export const SORTS_INAPPLICABLE_EQUIPMENT = [
	Sort.Power,
	Sort.Energy,
	Sort.Pattern,
	Sort.Shaped,
	Sort.StatTotal,
	Sort.StatDistribution,
	Sort.AmmoType,
	Sort.DamageType,
	Sort.WeaponType,
	Sort.Quantity,
	Sort.Harmonizable,
	Sort.CanShape,
	"stat-.*",
] as const;
export const FILTERS_INAPPLICABLE_EQUIPMENT = [
	Filter.Ammo,
	Filter.Element,
	Filter.Perk,
	Filter.Shaped,
	Filter.WeaponType,
	Filter.Harmonizable,
	Filter.Adept,
	Filter.Artifice,
	Filter.PatternComplete,
	Filter.Pattern,
] as const;

export const VIEW_ID_EQUIPMENT = "equipment";
export const VIEW_NAME_EQUIPMENT = "Equipment";

export const SORT_MANAGER_EQUIPMENT_DEFINITION: ISortManagerConfiguration = {
	id: VIEW_ID_EQUIPMENT,
	name: VIEW_NAME_EQUIPMENT,
	default: SORTS_DEFAULT_EQUIPMENT,
	inapplicable: SORTS_INAPPLICABLE_EQUIPMENT,
};

export const FILTER_MANAGER_EQUIPMENT_DEFINITION: IFilterManagerConfiguration = {
	id: VIEW_ID_EQUIPMENT,
	name: VIEW_NAME_EQUIPMENT,
	inapplicable: FILTERS_INAPPLICABLE_EQUIPMENT,
};

export default InventorySlotView.clone().configure({
	sort: new SortManager(SORT_MANAGER_EQUIPMENT_DEFINITION),
	filter: new FilterManager(FILTER_MANAGER_EQUIPMENT_DEFINITION),
	parentViewId: VIEW_ID_EQUIPMENT,
	mergedVaults: true,
});

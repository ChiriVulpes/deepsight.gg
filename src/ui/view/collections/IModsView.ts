import type { Plug } from "model/models/items/Plugs";
import Filter from "ui/inventory/filter/Filter";
import type { IFilterManagerConfiguration } from "ui/inventory/filter/FilterManager";
import FilterManager from "ui/inventory/filter/FilterManager";
import Sort from "ui/inventory/sort/Sort";
import type { ISortManagerConfiguration } from "ui/inventory/sort/SortManager";
import SortManager from "ui/inventory/sort/SortManager";

export const SORTS_DEFAULT_MODS = [
	Sort.Name,
] as const;
export const SORTS_INAPPLICABLE_MODS = [
	Sort.Power,
	Sort.Pattern,
	Sort.Shaped,
	Sort.Rarity,
	Sort.StatTotal,
	Sort.StatDistribution,
	Sort.Moment,
	Sort.AmmoType,
	Sort.WeaponType,
	Sort.Quantity,
	Sort.Locked,
	Sort.Harmonizable,
	Sort.Exotic,
	Sort.CanShape,
	Sort.BreakerType,
	"stat-.*",
] as const;
export const FILTERS_INAPPLICABLE_MODS = [
	Filter.Ammo,
	Filter.WeaponType,
	Filter.Rarity,
	Filter.Shaped,
	Filter.Harmonizable,
	Filter.Perk,
	Filter.Moment,
	Filter.Locked,
	Filter.Artifice,
	Filter.Pattern,
	Filter.PatternComplete,
	Filter.Duplicate,
	Filter.BreakerType,
] as const;

export const VIEW_ID_MODS = "mods";
export const VIEW_NAME_MODS = "Mods";

export const SORT_MANAGER_MODS_DEFINITION: ISortManagerConfiguration = {
	id: VIEW_ID_MODS,
	name: VIEW_NAME_MODS,
	default: SORTS_DEFAULT_MODS,
	inapplicable: SORTS_INAPPLICABLE_MODS,
};

export const FILTER_MANAGER_MODS_DEFINITION: IFilterManagerConfiguration = {
	id: VIEW_ID_MODS,
	name: VIEW_NAME_MODS,
	inapplicable: FILTERS_INAPPLICABLE_MODS,
};

export const SORT_MANAGER_MODS = new SortManager<Plug>(SORT_MANAGER_MODS_DEFINITION);
export const FILTER_MANAGER_MODS = new FilterManager<Plug>(FILTER_MANAGER_MODS_DEFINITION);

export enum ModsViewClasses {
	PlugList = "view-mods-plug-list",
	PlugListContent = "view-mods-plug-list-content",
	PlugListPage = "view-mods-plug-list-page",
	Plug = "view-mods-plug",
	TypeWrapper = "view-mods-type-wrapper",
}

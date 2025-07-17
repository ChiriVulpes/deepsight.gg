import type { Plug } from "model/models/items/Plugs";
import Filter from "ui/destiny/filter/Filter";
import type { IFilterManagerConfiguration } from "ui/destiny/filter/FilterManager";
import FilterManager from "ui/destiny/filter/FilterManager";
import Sort from "ui/destiny/sort/Sort";
import type { ISortManagerConfiguration } from "ui/destiny/sort/SortManager";
import SortManager from "ui/destiny/sort/SortManager";

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
	Sort.StatLegacyDistribution,
	Sort.Moment,
	Sort.AmmoType,
	Sort.WeaponType,
	Sort.Quantity,
	Sort.Locked,
	Sort.Harmonizable,
	Sort.Exotic,
	Sort.CanShape,
	Sort.BreakerType,
	Sort.Acquired,
	Sort.Featured,
	"stat-.*",
] as const;
export const FILTERS_INAPPLICABLE_MODS = [
	Filter.Ammo,
	Filter.WeaponType,
	Filter.Rarity,
	Filter.Shaped,
	Filter.Perk,
	Filter.Moment,
	Filter.Locked,
	Filter.Artifice,
	Filter.Pattern,
	Filter.Catalyst,
	Filter.Duplicate,
	Filter.BreakerType,
	Filter.Acquired,
	Filter.Featured,
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

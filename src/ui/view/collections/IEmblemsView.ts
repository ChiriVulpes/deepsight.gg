import type { IEmblem } from "model/models/Emblems";
import Filter from "ui/destiny/filter/Filter";
import type { IFilterManagerConfiguration } from "ui/destiny/filter/FilterManager";
import FilterManager from "ui/destiny/filter/FilterManager";
import Sort from "ui/destiny/sort/Sort";
import type { ISortManagerConfiguration } from "ui/destiny/sort/SortManager";
import SortManager from "ui/destiny/sort/SortManager";

export const SORTS_DEFAULT_EMBLEMS = [
	Sort.Name,
] as const;
export const SORTS_INAPPLICABLE_EMBLEMS = [
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
	Sort.Energy,
	Sort.Masterwork,
	Sort.DamageType,
	"stat-.*",
] as const;
export const FILTERS_INAPPLICABLE_EMBLEMS = [
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
	Filter.Element,
	Filter.Adept,
	Filter.Masterwork,
] as const;

export const VIEW_ID_EMBLEMS = "emblems";
export const VIEW_NAME_EMBLEMS = "Emblems";

export const SORT_MANAGER_EMBLEMS_DEFINITION: ISortManagerConfiguration = {
	id: VIEW_ID_EMBLEMS,
	name: VIEW_NAME_EMBLEMS,
	default: SORTS_DEFAULT_EMBLEMS,
	inapplicable: SORTS_INAPPLICABLE_EMBLEMS,
};

export const FILTER_MANAGER_EMBLEMS_DEFINITION: IFilterManagerConfiguration = {
	id: VIEW_ID_EMBLEMS,
	name: VIEW_NAME_EMBLEMS,
	inapplicable: FILTERS_INAPPLICABLE_EMBLEMS,
};

export const SORT_MANAGER_EMBLEMS = new SortManager<IEmblem>(SORT_MANAGER_EMBLEMS_DEFINITION);
export const FILTER_MANAGER_EMBLEMS = new FilterManager<IEmblem>(FILTER_MANAGER_EMBLEMS_DEFINITION);

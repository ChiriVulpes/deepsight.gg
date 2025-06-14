import Filter from "ui/destiny/filter/Filter";
import type { IFilterManagerConfiguration } from "ui/destiny/filter/FilterManager";
import FilterManager from "ui/destiny/filter/FilterManager";
import Sort from "ui/destiny/sort/Sort";
import type { ISortManagerConfiguration } from "ui/destiny/sort/SortManager";
import SortManager from "ui/destiny/sort/SortManager";
import InventorySlotView from "ui/view/inventory/slot/InventorySlotView";

export const SORTS_DEFAULT_ARMOUR = [
	Sort.Exotic,
	Sort.Rarity,
	Sort.StatDistribution,
	Sort.StatLegacyDistribution,
	Sort.Masterwork,
	Sort.Power,
	Sort.Energy,
] as const;
export const SORTS_INAPPLICABLE_ARMOUR = [
	Sort.Pattern,
	Sort.AmmoType,
	Sort.Shaped,
	Sort.WeaponType,
	Sort.Quantity,
	Sort.DamageType,
	Sort.Harmonizable,
	Sort.CanShape,
	Sort.Acquired,
] as const;
export const FILTERS_INAPPLICABLE_ARMOUR = [
	Filter.Ammo,
	Filter.WeaponType,
	Filter.Perk,
	Filter.Shaped,
	Filter.Element,
	Filter.Enhancement,
	Filter.Unlevelled,
	Filter.Adept,
	Filter.Catalyst,
	Filter.Pattern,
	Filter.Acquired,
] as const;

export const VIEW_ID_ARMOUR = "armour";
export const VIEW_NAME_ARMOUR = "Armour";

export const SORT_MANAGER_ARMOUR_DEFINITION: ISortManagerConfiguration = {
	id: VIEW_ID_ARMOUR,
	name: VIEW_NAME_ARMOUR,
	default: SORTS_DEFAULT_ARMOUR,
	inapplicable: SORTS_INAPPLICABLE_ARMOUR,
};

export const FILTER_MANAGER_ARMOUR_DEFINITION: IFilterManagerConfiguration = {
	id: VIEW_ID_ARMOUR,
	name: VIEW_NAME_ARMOUR,
	inapplicable: FILTERS_INAPPLICABLE_ARMOUR,
};

export default InventorySlotView.clone().configure({
	sort: new SortManager(SORT_MANAGER_ARMOUR_DEFINITION),
	filter: new FilterManager(FILTER_MANAGER_ARMOUR_DEFINITION),
	separateVaults: true,
	navGroupViewId: VIEW_ID_ARMOUR,
});

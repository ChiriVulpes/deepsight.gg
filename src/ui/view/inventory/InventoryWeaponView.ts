import FilterManager from "ui/inventory/filter/FilterManager";
import Sort from "ui/inventory/sort/Sort";
import SortManager from "ui/inventory/sort/SortManager";
import InventorySlotView from "ui/view/inventory/InventorySlotView";

export const SORTS_DEFAULT_WEAPONS = [Sort.Pattern, Sort.Power, Sort.Name] as const;
export const SORTS_INAPPLICABLE_WEAPONS = [Sort.Energy, Sort.StatTotal, Sort.StatDistribution] as const;
export const FILTERS_INAPPLICABLE_WEAPONS = [] as const;

export default InventorySlotView.clone().configure({
	sort: new SortManager({
		id: "weapons",
		name: "Weapons",
		default: SORTS_DEFAULT_WEAPONS,
		inapplicable: SORTS_INAPPLICABLE_WEAPONS,
	}),
	filter: new FilterManager({
		id: "weapons",
		name: "Weapons",
		inapplicable: FILTERS_INAPPLICABLE_WEAPONS,
	}),
});

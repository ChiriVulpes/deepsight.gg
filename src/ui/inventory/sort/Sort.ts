import type Item from "model/models/items/Item";
import type Component from "ui/Component";
import type { AnyComponent } from "ui/Component";
import type { SortableSort } from "ui/inventory/sort/ItemSort";

enum Sort {
	Power,
	Name,
	Energy,
	Pattern,
	Shaped,
	Masterwork,
	Rarity,
	StatTotal,
	StatDistribution,
	Moment,
	AmmoType,
	DamageType,
	WeaponType,
	Quantity,
	Locked,
	Harmonizable,
	Exotic,
	CanShape,
}

export default Sort;

export interface ISort {
	id: Sort | string;
	className?: string;
	name: string;
	shortName?: string;
	sort (itemA: Item, itemB: Item): number;
	render?(item: Item): AnyComponent | Promise<AnyComponent | undefined> | undefined;
	renderSortable?(sortable: SortableSort): any;
	renderSortableOptions?(wrapper: Component, update: () => void): any;
}

export namespace ISort {
	export function create (sort: ISort) {
		return sort;
	}
}

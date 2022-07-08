import type { Item } from "model/models/Items";
import type Component from "ui/Component";
import type { AnyComponent } from "ui/Component";
import type { SortableSort } from "ui/inventory/sort/ItemSort";

enum Sort {
	Power,
	Name,
	Energy,
	Deepsight,
	Pattern,
	Shaped,
	Masterwork,
	Rarity,
	StatTotal,
	StatDistribution,
	Source,
	AmmoType,
}

export default Sort;

export interface ISort {
	id: Sort;
	name: string;
	shortName?: string;
	sort (itemA: Item, itemB: Item): number;
	render?(item: Item): AnyComponent | Promise<AnyComponent> | undefined;
	renderSortable?(sortable: SortableSort): any;
	renderSortableOptions?(wrapper: Component, update: () => void): any;
}

export namespace ISort {
	export function create (sort: ISort) {
		return sort;
	}
}

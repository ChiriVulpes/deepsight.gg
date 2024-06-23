import type { IEmblem } from "model/models/Emblems";
import type Item from "model/models/items/Item";
import type { Plug } from "model/models/items/Plugs";
import type Component from "ui/component/Component";
import type { AnyComponent } from "ui/component/Component";
import type { SortableSort } from "ui/destiny/sort/ItemSort";

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
	BreakerType,
	Acquired,
}

export default Sort;

export interface ISort<T extends Item | Plug | IEmblem = Item | Plug | IEmblem> {
	type?: T extends Item ? "item" | undefined : T extends Plug ? "plug" : "emblem";
	id: Sort | string;
	className?: string;
	name: string;
	shortName?: string;
	sort (itemA: T, itemB: T): number;
	render?(item: T): AnyComponent | Promise<AnyComponent | undefined> | undefined;
	renderSortable?(sortable: SortableSort): any;
	renderSortableOptions?(wrapper: Component, update: () => void): any;
}

export namespace ISort {
	export function create<T extends Item | Plug | IEmblem = Item> (sort: ISort<T>) {
		return sort;
	}
}

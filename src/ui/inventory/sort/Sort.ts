import type { Item } from "model/models/Items";
import type { AnyComponent } from "ui/Component";

enum Sort {
	Power,
	Name,
	Energy,
	Deepsight,
	Pattern,
}

export default Sort;

export interface ISort {
	id: Sort;
	name: string;
	sort (itemA: Item, itemB: Item): number;
	render?(item: Item): AnyComponent | Promise<AnyComponent>;
}

export namespace ISort {
	export function create (sort: ISort) {
		return sort;
	}
}

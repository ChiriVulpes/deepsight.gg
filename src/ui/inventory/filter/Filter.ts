import type { Item } from "model/models/Items";

enum Filter {
	Ammo,
	Element,
	Raw,
}

export default Filter;

export interface IFilter {
	id: Filter;
	prefix: string;
	colour: number;
	suggestedValues?: string[];
	matches?(filterValue: string): boolean;
	apply (filterValue: string, item: Item): boolean;
}

export type IFilterGenerator = IFilter | (() => Promise<IFilter>);

export namespace IFilter {
	export function create (filter: IFilter) {
		return filter;
	}
	export function async (filterGenerator: () => Promise<IFilter>) {
		return filterGenerator;
	}
}

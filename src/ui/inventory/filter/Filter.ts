import type { Item } from "model/models/Items";

enum Filter {
	Ammo,
	Raw,
}

export default Filter;

export interface IFilter {
	id: Filter;
	prefix: string;
	colour: number;
	suggestedValues?: string[];
	matches?(filterValue: string): boolean;
	filter (filterValue: string, item: Item): boolean;
}

export namespace IFilter {
	export function create (filter: IFilter) {
		return filter;
	}
}

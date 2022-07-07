import type { Item } from "model/models/Items";

enum Filter {
	Ammo,
	Element,
	WeaponType,
	Perk,
	Raw,
}

export default Filter;

export interface IFilter {
	id: Filter;
	prefix: string;
	colour: `#${string}` | number | ((value: string) => `#${string}` | number);
	suggestedValues?: string[];
	suggestedValueHint?: string;
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

	export function colour (value: string, colour?: IFilter["colour"]) {
		if (colour === undefined)
			return undefined;

		if (typeof colour === "function")
			colour = colour(value);

		if (typeof colour === "string")
			return colour;

		return `#${colour.toString(16).padStart(6, "0")}`;
	}
}

import type EnumModel from "model/models/enum/EnumModel";
import type Item from "model/models/items/Item";
import type { Plug } from "model/models/items/Plugs";
import type { DisplayPropertied } from "ui/bungie/DisplayProperties";
import type { EnumModelIconPath } from "ui/bungie/EnumIcon";
import type { FilterChipButton } from "ui/inventory/filter/ItemFilter";
import Arrays from "utility/Arrays";
import type { SupplierOr } from "utility/Type";

enum Filter {
	Element,
	Ammo,
	WeaponType,
	Rarity,
	Masterwork,
	Adept,
	Shaped,
	Harmonizable,
	Perk,
	Moment,
	Locked,
	Artifice,
	Pattern,
	PatternComplete,
	Duplicate,
	BreakerType,
	Raw,
}

export default Filter;

export type IFilterSuggestedValue = {
	name: string;
	icon: string;
};

export interface IFilter<T extends Item | Plug = Item | Plug> {
	id: Filter;
	internalName?: string;
	prefix: string;
	suggestedValues?: (IFilterSuggestedValue | string)[];
	suggestedValueHint?: string;
	or?: true;
	matches?(filterValue: string): boolean;
	apply (filterValue: string, item: T): boolean;
	tweakChip?(chip: FilterChipButton, filterValue: string): any;
	colour: `#${string}` | number | ((value: string) => `#${string}` | number);
	maskIcon?: SupplierOr<string | EnumModelIconPath | EnumModel<any, DisplayPropertied> | undefined, [filterValue: string]>;
	icon?: SupplierOr<string | EnumModelIconPath | EnumModel<any, DisplayPropertied> | undefined, [filterValue: string]>;
}

export type IFilterGenerator = IFilter | (() => Promise<IFilter>);

export namespace IFilter {
	export function create<T extends Item | Plug = Item> (filter: IFilter<T>) {
		return filter;
	}
	export function createBoolean<T extends Item | Plug = Item> (filter: Omit<IFilter<T>, "prefix">): IFilter<T>[] {
		return ["is:", "not:"].map(prefix => ({
			...filter,
			prefix,
			apply: prefix === "not:" ? (filterValue, item) => !filter.apply(filterValue, item)
				: (filterValue, item) => filter.apply(filterValue, item),
		}));
	}
	export function async<T extends Item | Plug = Item> (filterGenerator: () => Promise<IFilter<T>>) {
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

	export function icon (value: string, icon?: IFilter["icon"]): string | EnumModelIconPath | undefined {
		if (typeof icon === "function")
			icon = icon(value);

		if (icon === undefined)
			return undefined;

		if (typeof icon === "string")
			return icon;

		if (Array.isArray(icon))
			return icon;

		return Arrays.tuple(icon, value);
	}
}

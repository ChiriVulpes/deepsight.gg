import type { Item } from "model/models/Items";
import type { IFilter } from "ui/inventory/filter/Filter";
import Filter from "ui/inventory/filter/Filter";
import AmmoFilter from "ui/inventory/filter/filters/AmmoFilter";

const filterMap: Record<Filter, IFilter> = {
	[Filter.Ammo]: AmmoFilter,
	[Filter.Raw]: {
		id: Filter.Raw,
		prefix: "",
		colour: 0,
		filter: (value: string, item: Item) =>
			item.definition.displayProperties.name.toLowerCase().includes(value.toLowerCase()),
	},
};

for (const [type, sort] of Object.entries(filterMap))
	if (+type !== sort.id)
		throw new Error(`Filter ${Filter[+type as Filter]} implementation miscategorised`);

export interface IFilterManagerConfiguration {
	id: string;
	name: string;
	readonly inapplicable: readonly Filter[];
}

export interface IConfiguredFilter {
	filter: Filter;
	value: string;
}

interface FilterManager extends IFilterManagerConfiguration { }
class FilterManager {

	private readonly current: IConfiguredFilter[] = [];
	public constructor (configuration: IFilterManagerConfiguration) {
		Object.assign(this, configuration);
	}

	public get () {
		return this.current;
	}

	public getApplicable () {
		return Object.values(filterMap)
			.filter(filter => !this.inapplicable.includes(filter.id))
			.sort((a, b) => a.id - b.id);
	}

	public add (token: string) {
		for (const filter of this.getApplicable()) {
			if (!token.startsWith(filter.prefix))
				continue;

			const value = token.slice(filter.prefix.length);
			if (filter.matches?.(value) ?? true) {
				this.current.push({
					filter: filter.id,
					value,
				});
				return filter;
			}
		}

		throw new Error(`Somehow, no filters matched the token "${token}" 😕`);
	}

	public reset () {
		this.current.splice(0, Infinity);
	}

}

export default FilterManager;

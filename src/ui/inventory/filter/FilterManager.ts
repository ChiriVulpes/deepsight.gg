import type { IFilter } from "ui/inventory/filter/Filter";
import Filter from "ui/inventory/filter/Filter";
import Store from "utility/Store";

const filterMap: Record<Filter, IFilter> = {
};

for (const [type, sort] of Object.entries(filterMap))
	if (+type !== sort.id)
		throw new Error(`Filter ${Filter[+type as Filter]} implementation miscategorised`);

export interface IFilterManagerConfiguration {
	id: string;
	name: string;
	readonly inapplicable: readonly Filter[];
}

interface FilterManager extends IFilterManagerConfiguration { }
class FilterManager {

	private readonly current: IFilter[] = [];
	public constructor (configuration: IFilterManagerConfiguration) {
		Object.assign(this, configuration);
		// this.current = (Store.get(`sort-${this.id}`) as Sort[] ?? this.default)
		// 	.map(filterType => filterMap[filterType]);
	}

	public get () {
		return this.current;
	}

	public getDisabled () {
		return Object.values(filterMap)
			.filter(sort => !this.current.includes(sort) && !this.inapplicable.includes(sort.id))
			.sort((a, b) => a.id - b.id);
	}

	public set (filter: IFilter[]) {
		this.current.splice(0, Infinity, ...filter);
		Store.set(`filter-${this.id}`, this.current.map(sort => sort.id));
	}

}

export default FilterManager;

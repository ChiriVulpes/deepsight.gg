import type Item from "model/models/items/Item";
import type { IFilter } from "ui/inventory/filter/Filter";
import Filter from "ui/inventory/filter/Filter";
import type ItemFilter from "ui/inventory/filter/ItemFilter";
import FilterAdept from "ui/inventory/filter/filters/FilterAdept";
import FilterAmmo from "ui/inventory/filter/filters/FilterAmmo";
import ElementFilter from "ui/inventory/filter/filters/FilterElement";
import FilterHarmonizable from "ui/inventory/filter/filters/FilterHarmonizable";
import FilterLocked from "ui/inventory/filter/filters/FilterLocked";
import FilterMasterwork from "ui/inventory/filter/filters/FilterMasterwork";
import FilterMoment from "ui/inventory/filter/filters/FilterMoment";
import FilterPerk from "ui/inventory/filter/filters/FilterPerk";
import FilterRarity from "ui/inventory/filter/filters/FilterRarity";
import FilterShaped from "ui/inventory/filter/filters/FilterShaped";
import FilterWeaponType from "ui/inventory/filter/filters/FilterWeaponType";
import Arrays from "utility/Arrays";
import Strings from "utility/Strings";

let filterMap: Record<Filter, IFilter> | undefined;

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

	public uiComponent?: ItemFilter;

	public constructor (configuration: IFilterManagerConfiguration) {
		Object.assign(this, configuration);
	}

	public static async init () {
		if (filterMap)
			return;

		const initialFilterMap: Record<Filter, Arrays.Or<IFilter>> = {
			[Filter.Ammo]: FilterAmmo,
			[Filter.Element]: await ElementFilter(),
			[Filter.WeaponType]: await FilterWeaponType(),
			[Filter.Perk]: await FilterPerk(),
			[Filter.Moment]: await FilterMoment(),
			[Filter.Shaped]: FilterShaped,
			[Filter.Masterwork]: FilterMasterwork,
			[Filter.Locked]: FilterLocked,
			[Filter.Harmonizable]: FilterHarmonizable,
			[Filter.Rarity]: await FilterRarity(),
			[Filter.Adept]: FilterAdept,
			[Filter.Raw]: {
				id: Filter.Raw,
				prefix: "",
				colour: undefined as any as 0,
				apply: (value: string, item: Item) =>
					new RegExp(`(?<=^| )${value}`).test(item.definition.displayProperties.name.toLowerCase()),
			},
		};

		for (let [type, filterArr] of Object.entries(initialFilterMap)) {
			filterArr = Arrays.resolve(filterArr);
			for (let i = 0; i < filterArr.length; i++) {
				const filter = filterArr[i];
				if (+type !== filter.id)
					throw new Error(`Filter ${Filter[+type as Filter]} implementation miscategorised`);

				filter.internalName ??= Filter[filter.id].toLowerCase();
				filter.id = (i ? `${filter.id}:${i}` : filter.id) as Filter;
				initialFilterMap[filter.id] = filter;
			}
		}

		filterMap = initialFilterMap as Record<Filter, IFilter>;
	}

	public getApplicable () {
		return Object.values(filterMap!)
			.filter(filter => !this.inapplicable.some(inapplicable => `${filter.id}`.startsWith(`${inapplicable}`)))
			.sort((a, b) => parseInt(`${a.id}`) - parseInt(`${b.id}`));
	}

	public apply (item: Item) {
		const orFilters = Array.from(new Set(this.current.map(filter => filter.filter)))
			.filter(filterId => filterMap![filterId].or)
			.map(filterId => this.current.filter(filter => filter.filter === filterId));

		const otherFilters = this.current.filter(filter => !filterMap![filter.filter].or);

		return otherFilters.every(filter => filterMap![filter.filter].apply(filter.value, item))
			&& orFilters.every(instances => instances.some(filter => filterMap![filter.filter].apply(filter.value, item)));
	}

	public add (token: string) {
		token = token.toLowerCase();
		for (const filter of this.getApplicable()) {
			if (!token.startsWith(filter.prefix))
				continue;

			const value = Strings.extractFromQuotes(token.slice(filter.prefix.length));

			if (filter.matches?.(value) ?? true) {
				this.current.push({
					filter: filter.id,
					value,
				});
				return filter;
			}
		}

		console.error(`Somehow, no filters matched the token "${token}" 😕`);
	}

	public reset () {
		this.current.splice(0, Infinity);
	}

	private last: IConfiguredFilter[] = [];
	public hasChanged () {
		const isIdentical = this.last.length === this.current.length
			&& this.last.every((filter, i) =>
				filter.filter === this.current[i].filter
				&& filter.value === this.current[i].value);

		// it's alright that it's the same filters, they get dumped from current rather than modified
		this.last = this.current.slice();
		return !isIdentical;
	}

	public getFilterIds () {
		return this.current.map(filter => `${filterMap![filter.filter].prefix}${filter.value}`);
	}
}

export default FilterManager;

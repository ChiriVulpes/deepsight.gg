import type { Item } from "model/models/Items";
import type { ISort } from "ui/inventory/sort/Sort";
import Sort from "ui/inventory/sort/Sort";
import SortDeepsight from "ui/inventory/sort/sorts/SortDeepsight";
import SortEnergy from "ui/inventory/sort/sorts/SortEnergy";
import SortMasterwork from "ui/inventory/sort/sorts/SortMasterwork";
import SortName from "ui/inventory/sort/sorts/SortName";
import SortPattern from "ui/inventory/sort/sorts/SortPattern";
import SortPower from "ui/inventory/sort/sorts/SortPower";
import SortRarity from "ui/inventory/sort/sorts/SortRarity";
import SortStatDistribution from "ui/inventory/sort/sorts/SortStatDistribution";
import SortStatTotal from "ui/inventory/sort/sorts/SortStatTotal";
import Store from "utility/Store";

const sortMap: Record<Sort, ISort> = {
	[Sort.Name]: SortName,
	[Sort.Power]: SortPower,
	[Sort.Energy]: SortEnergy,
	[Sort.Deepsight]: SortDeepsight,
	[Sort.Pattern]: SortPattern,
	[Sort.Masterwork]: SortMasterwork,
	[Sort.Rarity]: SortRarity,
	[Sort.StatTotal]: SortStatTotal,
	[Sort.StatDistribution]: SortStatDistribution,
};

for (const [type, sort] of Object.entries(sortMap))
	if (+type !== sort.id)
		throw new Error(`Sort ${Sort[+type as Sort]} implementation miscategorised`);

export interface ISortManagerConfiguration {
	id: string;
	name: string;
	readonly default: readonly Sort[];
	readonly inapplicable: readonly Sort[];
}

interface SortManager extends ISortManagerConfiguration { }
class SortManager {

	private readonly current: ISort[];
	public constructor (configuration: ISortManagerConfiguration) {
		Object.assign(this, configuration);
		this.current = (Store.get(`sort-${this.id}`) as Sort[] ?? this.default)
			.map(sortType => sortMap[sortType]);
	}

	public get () {
		return this.current;
	}

	public getDisabled () {
		return Object.values(sortMap)
			.filter(sort => !this.current.includes(sort) && !this.inapplicable.includes(sort.id))
			.sort((a, b) => a.id - b.id);
	}

	public set (sort: ISort[]) {
		this.current.splice(0, Infinity, ...sort);
		Store.set(`sort-${this.id}`, this.current.map(sort => sort.id));
	}

	public sort (items: readonly Item[]) {
		return items.slice().sort((itemA, itemB) => {
			for (const sort of this.current) {
				const result = sort.sort(itemA, itemB);
				if (result !== 0)
					return result;
			}

			const hasInstanceDifference = Number(!!itemB.reference.itemInstanceId) - Number(!!itemA.reference.itemInstanceId);
			if (hasInstanceDifference)
				// sort things with an instance id before things without an instance id
				return hasInstanceDifference;

			return (itemA.reference.itemInstanceId ?? `${itemA.reference.itemHash}`)?.localeCompare(itemB.reference.itemInstanceId ?? `${itemB.reference.itemHash}`);
		});
	}
}

export default SortManager;

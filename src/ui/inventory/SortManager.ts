import type { Item } from "model/models/Items";
import type { ISort } from "ui/inventory/sort/Sort";
import Sort from "ui/inventory/sort/Sort";
import SortDeepsight from "ui/inventory/sort/SortDeepsight";
import SortEnergy from "ui/inventory/sort/SortEnergy";
import SortName from "ui/inventory/sort/SortName";
import SortPattern from "ui/inventory/sort/SortPattern";
import SortPower from "ui/inventory/sort/SortPower";
import Store from "utility/Store";

const sortMap: Record<Sort, ISort> = {
	[Sort.Name]: SortName,
	[Sort.Power]: SortPower,
	[Sort.Energy]: SortEnergy,
	[Sort.Deepsight]: SortDeepsight,
	[Sort.Pattern]: SortPattern,
};

export interface ISortManagerConfiguration {
	id: string;
	name: string;
	readonly default: readonly Sort[];
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

			return 0;
		});
	}
}

export default SortManager;

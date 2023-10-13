import type Item from "model/models/items/Item";
import type { ISort } from "ui/inventory/sort/Sort";
import Sort from "ui/inventory/sort/Sort";
import SortAmmoType from "ui/inventory/sort/sorts/SortAmmoType";
import SortDamageType from "ui/inventory/sort/sorts/SortDamageType";
import SortEnergy from "ui/inventory/sort/sorts/SortEnergy";
import SortLocked from "ui/inventory/sort/sorts/SortLocked";
import SortMasterwork from "ui/inventory/sort/sorts/SortMasterwork";
import SortName from "ui/inventory/sort/sorts/SortName";
import SortPattern from "ui/inventory/sort/sorts/SortPattern";
import SortPower from "ui/inventory/sort/sorts/SortPower";
import SortQuantity from "ui/inventory/sort/sorts/SortQuantity";
import SortRarity from "ui/inventory/sort/sorts/SortRarity";
import SortShaped from "ui/inventory/sort/sorts/SortShaped";
import SortSource from "ui/inventory/sort/sorts/SortSource";
import SortStatDistribution from "ui/inventory/sort/sorts/SortStatDistribution";
import SortStatTotal from "ui/inventory/sort/sorts/SortStatTotal";
import GenerateStatsSorts from "ui/inventory/sort/sorts/SortStats";
import SortWeaponType from "ui/inventory/sort/sorts/SortWeaponType";
import Store from "utility/Store";

const BASE_SORT_MAP: Record<Sort, ISort> = {
	[Sort.Name]: SortName,
	[Sort.Power]: SortPower,
	[Sort.Energy]: SortEnergy,
	[Sort.Pattern]: SortPattern,
	[Sort.Masterwork]: SortMasterwork,
	[Sort.Rarity]: SortRarity,
	[Sort.StatTotal]: SortStatTotal,
	[Sort.StatDistribution]: SortStatDistribution,
	[Sort.Source]: SortSource,
	[Sort.Shaped]: SortShaped,
	[Sort.AmmoType]: SortAmmoType,
	[Sort.DamageType]: SortDamageType,
	[Sort.WeaponType]: SortWeaponType,
	[Sort.Quantity]: SortQuantity,
	[Sort.Locked]: SortLocked,
};

const DYNAMIC_SORTS: (() => Promise<ISort[]>)[] = [
	GenerateStatsSorts,
];

for (const [type, sort] of Object.entries(BASE_SORT_MAP))
	if (+type !== sort.id)
		throw new Error(`Sort ${Sort[+type as Sort]} implementation miscategorised`);

export interface ISortManagerConfiguration {
	id: string;
	name: string;
	readonly default: readonly (Sort | string)[];
	readonly inapplicable: readonly (Sort | string)[];
}

interface SortManager extends ISortManagerConfiguration { }
class SortManager {

	private static sortMap: Record<Sort | string, ISort> = BASE_SORT_MAP;

	public static registerSort (id: string, sort: ISort) {
		if (this.sortMap[id])
			throw new Error(`Attempted to dynamically re-register sort ${id}`);

		this.sortMap[id] = sort;
	}

	private static initialised = false;
	private static onInitFunctions: (() => void)[] = [];
	private static onInit (fn: () => void) {
		if (SortManager.initialised)
			fn();
		else
			SortManager.onInitFunctions.push(fn);
	}

	public static async init () {
		if (SortManager.initialised)
			return;

		SortManager.initialised = true;
		for (const gen of DYNAMIC_SORTS) {
			for (const sort of await gen()) {
				if (typeof sort.id === "number")
					throw new Error(`Cannot dynamically register sorts with numeric IDs, registered ${sort.id}`);

				this.registerSort(sort.id, sort);
			}
		}

		for (const onInit of SortManager.onInitFunctions)
			onInit();
	}

	private current!: ISort[];
	public constructor (configuration: ISortManagerConfiguration) {
		this.setConfiguration(configuration);
	}

	private setConfiguration (configuration: ISortManagerConfiguration) {
		Object.assign(this, configuration);

		SortManager.onInit(() => {
			let sort: readonly (Sort | string)[] = (Store.get(`sort-${this.id}`) as string[] ?? [])
				.map((sortName): Sort | string => Sort[sortName as keyof typeof Sort] ?? sortName)
				.filter(sort => SortManager.sortMap[sort]);

			if (!sort.length)
				sort = this.default;

			this.current = sort.map(sortType => SortManager.sortMap[sortType]);
		});
	}

	public get () {
		return this.current;
	}

	public getDisabled () {
		return Object.values(SortManager.sortMap)
			.filter(sort => !this.current.includes(sort) && !this.inapplicable.includes(sort.id))
			.sort((a, b) => 0
				|| (typeof a.id === "number" ? a.id : 99999999999) - (typeof b.id === "number" ? b.id : 99999999999)
				|| `${a.id}`.localeCompare(`${b.id}`));
	}

	public set (sort: ISort[]) {
		this.current.splice(0, Infinity, ...sort);
		Store.set(`sort-${this.id}`, this.current.map(sort => typeof sort.id === "number" ? Sort[sort.id] : sort.id));
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

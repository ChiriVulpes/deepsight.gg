import type { IEmblem } from "model/models/Emblems";
import type Item from "model/models/items/Item";
import type { Plug } from "model/models/items/Plugs";
import type { ISort } from "ui/destiny/sort/Sort";
import Sort from "ui/destiny/sort/Sort";
import SortAcquired from "ui/destiny/sort/sorts/SortAcquired";
import SortAmmoType from "ui/destiny/sort/sorts/SortAmmoType";
import SortBreakerType from "ui/destiny/sort/sorts/SortBreakerType";
import SortCanShape from "ui/destiny/sort/sorts/SortCanShape";
import SortDamageType from "ui/destiny/sort/sorts/SortDamageType";
import SortEnergy from "ui/destiny/sort/sorts/SortEnergy";
import SortExotic from "ui/destiny/sort/sorts/SortExotic";
import SortHarmonizable from "ui/destiny/sort/sorts/SortHarmonizable";
import SortLocked from "ui/destiny/sort/sorts/SortLocked";
import SortMasterwork from "ui/destiny/sort/sorts/SortMasterwork";
import SortMoment from "ui/destiny/sort/sorts/SortMoment";
import SortName from "ui/destiny/sort/sorts/SortName";
import SortPattern from "ui/destiny/sort/sorts/SortPattern";
import SortPower from "ui/destiny/sort/sorts/SortPower";
import SortQuantity from "ui/destiny/sort/sorts/SortQuantity";
import SortRarity from "ui/destiny/sort/sorts/SortRarity";
import SortShaped from "ui/destiny/sort/sorts/SortShaped";
import SortStatDistribution from "ui/destiny/sort/sorts/SortStatDistribution";
import SortStatTotal from "ui/destiny/sort/sorts/SortStatTotal";
import GenerateStatsSorts from "ui/destiny/sort/sorts/SortStats";
import SortWeaponType from "ui/destiny/sort/sorts/SortWeaponType";
import { EventManager } from "utility/EventManager";
import Store from "utility/Store";
import type { Mutable, PromiseOr } from "utility/Type";
import Bound from "utility/decorator/Bound";

const BASE_SORT_MAP: Record<Sort, ISort> = {
	[Sort.Name]: SortName,
	[Sort.Power]: SortPower,
	[Sort.Energy]: SortEnergy,
	[Sort.Pattern]: SortPattern,
	[Sort.Masterwork]: SortMasterwork,
	[Sort.Rarity]: SortRarity,
	[Sort.StatTotal]: SortStatTotal,
	[Sort.StatDistribution]: SortStatDistribution,
	[Sort.Moment]: SortMoment,
	[Sort.Shaped]: SortShaped,
	[Sort.AmmoType]: SortAmmoType,
	[Sort.DamageType]: SortDamageType,
	[Sort.WeaponType]: SortWeaponType,
	[Sort.Quantity]: SortQuantity,
	[Sort.Locked]: SortLocked,
	[Sort.Harmonizable]: SortHarmonizable,
	[Sort.Exotic]: SortExotic,
	[Sort.CanShape]: SortCanShape,
	[Sort.BreakerType]: SortBreakerType,
	[Sort.Acquired]: SortAcquired,
};

const DYNAMIC_SORTS: (() => Promise<ISort[]>)[] = [
	GenerateStatsSorts,
];

for (const [type, sort] of Object.entries(BASE_SORT_MAP))
	if (+type !== sort.id)
		throw new Error(`Sort ${Sort[+type as Sort]} implementation miscategorised`);

export interface ISortManagerEvents {
	update: Event;
}

type ConfiguredSort = Sort | string | { reverse: Sort | string };

export interface ISortManagerConfiguration {
	id: string;
	name: string;
	readonly default: readonly ConfiguredSort[];
	readonly inapplicable: readonly (Sort | string)[];
}

interface SortManager<T extends Item | Plug | IEmblem = Item> extends Omit<ISortManagerConfiguration, "inapplicable"> { }
class SortManager<T extends Item | Plug | IEmblem = Item> {

	private inapplicableIds: Sort[] = [];
	private inapplicableRegExp: RegExp[] = [];
	private static sortMap: Record<Sort | string, ISort> = BASE_SORT_MAP;

	public static registerSort (id: string, sort: ISort) {
		if (this.sortMap[id])
			throw new Error(`Attempted to dynamically re-register sort ${id}`);

		this.sortMap[id] = sort;
	}

	private static initialised: false | PromiseOr<true> = false;
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

		return SortManager.initialised = (async () => {
			for (const gen of DYNAMIC_SORTS) {
				for (const sort of await gen()) {
					if (typeof sort.id === "number")
						throw new Error(`Cannot dynamically register sorts with numeric IDs, registered ${sort.id}`);

					this.registerSort(sort.id, sort);
				}
			}

			for (const onInit of SortManager.onInitFunctions)
				onInit();

			return SortManager.initialised = true as const;
		})();
	}

	public readonly event = new EventManager<this, ISortManagerEvents>(this);

	private current!: ISort[];
	private reversed!: Partial<Record<Sort | string, boolean>>;
	public constructor (configuration: ISortManagerConfiguration) {
		this.setConfiguration(configuration);
	}

	private setConfiguration (configuration: ISortManagerConfiguration) {
		Object.assign(this, configuration);

		this.inapplicableIds = configuration.inapplicable.filter((sort): sort is number => typeof sort === "number");
		this.inapplicableRegExp = configuration.inapplicable.filter((sort): sort is string => typeof sort === "string")
			.map(regexString => new RegExp(`^${regexString}$`));

		(this as Mutable<SortManager<T>>).default = this.default.filter(sort => !this.isInapplicable(SortManager.sortMap[typeof sort === "object" ? sort.reverse : sort]));

		SortManager.onInit(() => {
			let sort: readonly (Sort | string)[] = (Store.get(`sort-${this.id}`) as string[] ?? [])
				.map((sortName): Sort | string => Sort[sortName as keyof typeof Sort] ?? sortName)
				.filter(sort => SortManager.sortMap[sort]);

			const reversed: Partial<Record<Sort | string, boolean>> = Store.get(`sort-${this.id}-reversed`) ?? {};

			if (!sort.length) {
				sort = this.default.map(sort => typeof sort === "object" ? sort.reverse : sort);
				for (const sortType of this.default) {
					const sort = SortManager.sortMap[typeof sortType === "object" ? sortType.reverse : sortType];
					const id = this.stringifyId(sort);
					if (typeof sortType === "object") {
						reversed[id] = true;
					} else {
						delete reversed[id];
					}
				}
			}

			this.current = sort.map(sortType => SortManager.sortMap[sortType]);
			this.reversed = reversed;
		});
	}

	public get () {
		return this.current;
	}

	public getStateHash () {
		return this.current
			.map(sort => `${sort.id}:${this.isReversed(sort)}`)
			.join(",");
	}

	public isReversed (sort: Sort | string | ISort) {
		return this.reversed[typeof sort === "object" ? this.stringifyId(sort) : sort] ?? false;
	}

	public getDisabled () {
		return Object.values(SortManager.sortMap)
			.filter(sort => !this.current.includes(sort) && !this.isInapplicable(sort))
			.sort((a, b) => 0
				|| (typeof a.id === "number" ? a.id : 99999999999) - (typeof b.id === "number" ? b.id : 99999999999)
				|| `${a.id}`.localeCompare(`${b.id}`));
	}

	@Bound private isInapplicable (sort: ISort) {
		return this.inapplicableIds.includes(sort.id as number)
			|| this.inapplicableRegExp.some(regex => regex.test(`${sort.id}`));
	}

	public set (sort: ISort[], emit = true) {
		this.current.splice(0, Infinity, ...sort);
		Store.set(`sort-${this.id}`, this.current.map(this.stringifyId));

		if (emit)
			this.event.emit("update");
	}

	public setReversed (sort: ISort[], emit = true) {
		Store.set(`sort-${this.id}-reversed`, this.reversed = {
			...Store.get(`sort-${this.id}-reversed`),
			...this.current.toObject(current => [this.stringifyId(current), sort.includes(current)]),
		});

		if (emit)
			this.event.emit("update");
	}

	@Bound private stringifyId (sort: ISort) {
		return typeof sort.id === "number" ? Sort[sort.id] : sort.id;
	}

	@Bound public sort (itemA: T, itemB: T, requireDifference = true) {
		for (const sort of this.current) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			let result = sort.sort(itemA as any, itemB as any);

			if (this.reversed[this.stringifyId(sort)])
				result = -result;

			if (result !== 0)
				return result;
		}

		if ("id" in itemA && "id" in itemB) {
			const hasInstanceDifference = Number(!!itemB.reference.itemInstanceId) - Number(!!itemA.reference.itemInstanceId);
			if (hasInstanceDifference)
				// sort things with an instance id before things without an instance id
				return hasInstanceDifference;
		}

		if (!requireDifference)
			return 0;

		const partialItemA = itemA as Partial<Item> & Partial<Plug>;
		const partialItemB = itemB as Partial<Item> & Partial<Plug>;
		const compareA = partialItemA.reference?.itemInstanceId ?? `${partialItemA.reference?.itemHash ?? partialItemA.baseItem?.hash ?? 0}`;
		const compareB = partialItemB.reference?.itemInstanceId ?? `${partialItemB.reference?.itemHash ?? partialItemB.baseItem?.hash ?? 0}`;
		return compareA.localeCompare(compareB);
	}
}

export default SortManager;

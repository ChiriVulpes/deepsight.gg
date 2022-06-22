import type { Item } from "model/models/Items";
import Store from "utility/Store";

export enum Stat {
	// armour
	Mobility = 2996146975,
	Resilience = 392767087,
	Recovery = 1943323491,
	Discipline = 1735777505,
	Intellect = 144602215,
	Strength = 4244567218,
}

export const ARMOUR_STAT_GROUPS: [Stat, Stat, Stat][] = [
	[Stat.Mobility, Stat.Resilience, Stat.Recovery],
	[Stat.Discipline, Stat.Intellect, Stat.Strength],
];

export const ARMOUR_STAT_MIN = 2;
export const ARMOUR_STAT_MAX = 30;
export const ARMOUR_GROUP_STATS_MAX = 34;

export interface IStatDistribution {
	overall: number;
	groups: number[];
}

export namespace IStatDistribution {
	export function getPreferredValue (stat: Stat) {
		return Store.get<number>(`preferredStatDistribution.${Stat[stat]}`) ?? ARMOUR_STAT_MAX;
	}

	export function setPreferredValue (stat: Stat, value: number) {
		Store.set(`preferredStatDistribution.${Stat[stat]}`, value);
	}

	export function get (item: Item): IStatDistribution {
		if (!item.stats)
			return { overall: 0, groups: ARMOUR_STAT_GROUPS.map(_ => 0) };

		const result: IStatDistribution = { overall: 0, groups: [] };

		let total = 0;
		for (const group of ARMOUR_STAT_GROUPS) {
			let groupTotal = 0;
			let stats = 0;
			for (const stat of group) {
				const nearness = 1 - Math.abs(getPreferredValue(stat) - (item.stats[stat]?.intrinsic ?? 0)) / ARMOUR_STAT_MAX;
				groupTotal += nearness;
				stats++;
			}

			const groupDistribution = groupTotal / stats;
			result.groups.push(groupDistribution);
			total += groupDistribution;
		}

		result.overall = total / ARMOUR_STAT_GROUPS.length;
		return result;
	}
}
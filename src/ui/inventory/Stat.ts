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

	export function isEnabled (stat: Stat) {
		return Store.get<boolean>(`preferredStatDistribution.${Stat[stat]}.enabled`) ?? true;
	}
	export function setIsEnabled (stat: Stat, enabled: boolean) {
		Store.set(`preferredStatDistribution.${Stat[stat]}.enabled`, enabled);
	}

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
		let groups = 0;
		for (const group of ARMOUR_STAT_GROUPS) {
			let groupEnabledNearnessTotal = 0;
			let groupDisabledTotal = 0;
			let disabledStatsMax = ARMOUR_GROUP_STATS_MAX;
			let stats = 0;
			for (const stat of group) {
				const statValue = item.stats[stat]?.intrinsic ?? 0;
				if (!isEnabled(stat)) {
					groupDisabledTotal += statValue;
					continue;
				}

				disabledStatsMax -= statValue;
				const nearness = 1 - Math.abs(getPreferredValue(stat) - statValue) / ARMOUR_STAT_MAX;
				groupEnabledNearnessTotal += nearness;
				stats++;
			}

			if (groupDisabledTotal) {
				const qualityOfDisabledStats = groupDisabledTotal / disabledStatsMax;
				groupEnabledNearnessTotal += qualityOfDisabledStats;
				stats++;
			}

			const groupDistribution = groupEnabledNearnessTotal / stats;
			result.groups.push(groupDistribution);
			total += groupDistribution;
			groups++;
		}

		result.overall = groups ? total / groups : 1;
		return result;
	}
}
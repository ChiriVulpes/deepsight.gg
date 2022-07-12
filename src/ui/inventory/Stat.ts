import type { Item } from "model/models/Items";
import Store from "utility/Store";

export enum Stat {
	// Unrendered
	Attack = 1480404414,
	Defense = 3897883278,
	Power = 1935470627,
	InventorySize = 1931675084,
	Mystery1 = 1885944937,
	Mystery2 = 3291498656,

	// weapons
	Stability = 155624089,
	Magazine = 3871231066,
	RPM = 4284893193,
	AirborneEffectiveness = 2714457168,
	AimAssistance = 1345609583,
	RecoilDirection = 2715839340,
	Zoom = 3555269338,
	ChargeTime = 2961396640,

	// armour
	Mobility = 2996146975,
	Resilience = 392767087,
	Recovery = 1943323491,
	Discipline = 1735777505,
	Intellect = 144602215,
	Strength = 4244567218,
}

export type StatOrder = number | { after: Stat, before?: undefined } | { before: Stat, after?: undefined };

export const STAT_DISPLAY_ORDER: Partial<Record<Stat, StatOrder>> = {
	[Stat.RPM]: -1,
	[Stat.AirborneEffectiveness]: { after: Stat.Stability },
	[Stat.AimAssistance]: { after: Stat.AirborneEffectiveness },
	[Stat.RecoilDirection]: { after: Stat.AimAssistance },
	[Stat.Zoom]: 1000,
	[Stat.Magazine]: 1001,
};

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
		if (!item.stats || !ARMOUR_STAT_GROUPS.flat().some(stat => item.stats?.values[stat]?.intrinsic))
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
				const statValue = item.stats.values[stat]?.intrinsic ?? 0;
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

		result.overall = total / groups;
		return result;
	}
}
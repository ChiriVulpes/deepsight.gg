import { StatHashes } from "@deepsight.gg/enums";
import type { DestinyClass } from "bungie-api-ts/destiny2";
import type Item from "model/models/items/Item";
import Store from "utility/Store";

// for reference:
StatHashes.Accuracy;

// Don't use bungie-api/ts/destiny2.StatHashes because it's a const enum and we use the names for css classes
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
	Range = 1240592695,
	Magazine = 3871231066,
	AmmoCapacity = 925767036,
	RPM = 4284893193,
	DrawTime = 447667954,
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

	// ghosts
	GhostEnergyCapacity = 237763788,
	ModCost = 514071887,
}

export type StatOrder = number | { after: Stat, before?: undefined } | { before: Stat, after?: undefined };

export const STAT_DISPLAY_ORDER: Partial<Record<Stat, StatOrder>> = {
	[Stat.RPM]: -1,
	[Stat.AirborneEffectiveness]: { after: Stat.Stability },
	[Stat.AimAssistance]: { after: Stat.AirborneEffectiveness },
	[Stat.Zoom]: { after: Stat.AimAssistance },
	[Stat.RecoilDirection]: { after: Stat.Zoom },
	[Stat.Magazine]: 1001,
	[Stat.AmmoCapacity]: 1002,
};

export type StatGroup = [Stat, Stat, Stat];

export const ARMOUR_STAT_GROUPS: StatGroup[] = [
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

export const IStatDistribution = new class StatDistributionManager {

	private readonly enabled: Partial<Record<DestinyClass, Partial<Record<Stat, boolean>>>> = {};
	private readonly preferred: Partial<Record<DestinyClass, Partial<Record<Stat, number>>>> = {};

	public isEnabled (stat: Stat, classType: DestinyClass) {
		let enabled = this.enabled[classType]?.[stat];
		if (enabled === undefined) {
			this.enabled[classType] ??= {};
			this.enabled[classType]![stat] = enabled = Store.get(`preferredStatDistribution.${classType}.${Stat[stat]}.enabled`) ?? true;
		}
		return enabled;
	}

	public getPreferredValue (stat: Stat, classType: DestinyClass) {
		let preferred = this.preferred[classType]?.[stat];
		if (preferred === undefined) {
			this.preferred[classType] ??= {};
			this.preferred[classType]![stat] = preferred = Store.get(`preferredStatDistribution.${classType}.${Stat[stat]}`) ?? ARMOUR_STAT_MAX;
		}
		return preferred;
	}

	public setIsEnabled (stat: Stat, classType: DestinyClass, enabled: boolean) {
		if (this.isEnabled(stat, classType) === enabled)
			return;

		this.enabled[classType]![stat] = enabled;
		Store.set(`preferredStatDistribution.${classType}.${Stat[stat]}.enabled`, enabled);
	}

	public setPreferredValue (stat: Stat, classType: DestinyClass, value: number) {
		if (this.getPreferredValue(stat, classType) === value)
			return;

		this.preferred[classType]![stat] = value;
		Store.set(`preferredStatDistribution.${classType}.${Stat[stat]}`, value);
	}

	public get (item: Item): IStatDistribution {
		if (!item.stats || !ARMOUR_STAT_GROUPS.flat().some(stat => item.stats?.values[stat]?.roll))
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
				const statValue = item.stats.values[stat]?.roll ?? 0;
				if (!this.isEnabled(stat, item.definition.classType)) {
					groupDisabledTotal += statValue;
					continue;
				}

				disabledStatsMax -= statValue;
				const nearness = 1 - Math.abs(this.getPreferredValue(stat, item.definition.classType) - statValue) / ARMOUR_STAT_MAX;
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
};
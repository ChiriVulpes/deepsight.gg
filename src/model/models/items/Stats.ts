import type { DestinyItemStatBlockDefinition, DestinyStatDefinition, DestinyStatDisplayDefinition, DestinyStatGroupDefinition } from "bungie-api-ts/destiny2";
import { DestinyItemSubType } from "bungie-api-ts/destiny2";
import type { IItemInit } from "model/models/items/Item";
import type Plugs from "model/models/items/Plugs";
import type { Manifest } from "model/models/Manifest";
import type { StatOrder } from "ui/inventory/Stat";
import { Stat, STAT_DISPLAY_ORDER } from "ui/inventory/Stat";
import Maths from "utility/maths/Maths";

export interface IStat {
	hash: number;
	definition: DestinyStatDefinition;
	order: StatOrder;
	max?: number;
	bar: boolean;
	value: number;
	intrinsic: number;
	masterwork: number;
	mod: number;
}

export interface IStats {
	values: Record<number, IStat>;
	block: DestinyItemStatBlockDefinition;
	definition: DestinyStatGroupDefinition;
}

namespace Stats {

	export interface IStatsProfile extends
		Plugs.IPlugsProfile { }

	export async function apply (manifest: Manifest, profile: IStatsProfile, item: IItemInit) {
		item.stats = await resolve(manifest, profile, item);
	}

	async function resolve (manifest: Manifest, profile: IStatsProfile, item: IItemInit): Promise<IStats | undefined> {
		if (!item.definition.stats)
			return undefined;

		const { DestinyStatGroupDefinition, DestinyStatDefinition } = manifest;

		const statGroupDefinition = await DestinyStatGroupDefinition.get(item.definition.stats?.statGroupHash);
		if (!statGroupDefinition)
			return undefined;

		const sockets = (await item.sockets) ?? [];
		const intrinsicStats = sockets.filter(socket => socket?.definition.plug?.plugCategoryIdentifier === "intrinsics")
			.flatMap(plug => plug?.definition.investmentStats)
			.concat(item.definition.investmentStats);

		const stats = profile.itemComponents?.stats.data?.[item.reference.itemInstanceId!]?.stats;
		if (stats)
			for (const intrinsic of intrinsicStats)
				if (intrinsic && !intrinsic.isConditionallyActive)
					stats[intrinsic.statTypeHash] ??= { statHash: intrinsic.statTypeHash, value: intrinsic.value };

		const masterworkStats = sockets.find(socket => socket?.definition.plug?.uiPlugLabel === "masterwork")
			?.definition.investmentStats ?? [];

		const modStats = sockets.filter(socket => socket?.definition.plug?.plugCategoryIdentifier !== "intrinsics" && socket?.definition.plug?.uiPlugLabel !== "masterwork")
			.flatMap(plug => plug?.definition.investmentStats);

		const result: Record<number, IStat> = {};

		for (const [hashString, { value }] of Object.entries(stats ?? {})) {
			const hash = +hashString;
			const statDefinition = await DestinyStatDefinition.get(hash);
			if (!statDefinition) {
				console.warn("Unknown stat", hash, "value", value);
				continue;
			}

			const displayIndex = statGroupDefinition.scaledStats.findIndex(stat => stat.statHash === hash);
			const display = statGroupDefinition.scaledStats[displayIndex] as DestinyStatDisplayDefinition | undefined;

			const stat: IStat = result[hash] = {
				hash,
				value,
				definition: statDefinition,
				max: hash === Stat.ChargeTime && item.definition.itemSubType === DestinyItemSubType.FusionRifle ? 1000 : display?.maximumValue ?? 100,
				bar: !(display?.displayAsNumeric ?? false),
				order: STAT_DISPLAY_ORDER[hash as Stat] ?? (displayIndex === -1 ? 10000 : displayIndex),
				intrinsic: 0,
				mod: 0,
				masterwork: 0,
			};

			const statDisplay = statGroupDefinition.scaledStats.find(statDisplay => statDisplay.statHash === hash);
			function interpolate (value: number) {
				if (!statDisplay?.displayInterpolation.length)
					return value;

				const start = statDisplay.displayInterpolation.findLast(stat => stat.value <= value) ?? statDisplay.displayInterpolation[0];
				const end = statDisplay.displayInterpolation.find(stat => stat.value > value) ?? statDisplay.displayInterpolation[statDisplay.displayInterpolation.length - 1];
				if (start === end)
					return start.weight;

				const t = (value - start.value) / (end.value - start.value);
				return Maths.bankersRound(start.weight + t * (end.weight - start.weight));
			}

			for (const intrinsic of intrinsicStats)
				if (hash === intrinsic?.statTypeHash && !intrinsic.isConditionallyActive)
					stat.intrinsic += intrinsic.value;

			for (const masterwork of masterworkStats)
				if (hash === masterwork.statTypeHash && !masterwork.isConditionallyActive)
					stat.masterwork += masterwork.value;

			for (const mod of modStats)
				if (hash === mod?.statTypeHash && !mod.isConditionallyActive)
					stat.mod += mod.value;

			const { intrinsic, masterwork, mod } = stat;
			stat.intrinsic = interpolate(intrinsic);
			stat.mod = interpolate(intrinsic + mod) - stat.intrinsic;
			stat.masterwork = interpolate(intrinsic + masterwork) - stat.intrinsic;
		}

		return {
			values: result,
			definition: statGroupDefinition,
			block: item.definition.stats,
		};
	}
}

export default Stats;

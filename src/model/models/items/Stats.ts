import { ItemCategoryHashes } from "@deepsight.gg/enums";
import { DeepsightPlugCategory } from "@deepsight.gg/plugs";
import type { DestinyItemComponentSetOfint64, DestinyItemStatBlockDefinition, DestinyStatDefinition, DestinyStatDisplayDefinition, DestinyStatGroupDefinition } from "bungie-api-ts/destiny2";
import { DestinyItemSubType } from "bungie-api-ts/destiny2";
import type Manifest from "model/models/Manifest";
import type { IItemInit } from "model/models/items/Item";
import { Socket } from "model/models/items/Plugs";
import type { StatOrder } from "ui/inventory/Stat";
import { STAT_DISPLAY_ORDER, Stat } from "ui/inventory/Stat";
import Maths from "utility/maths/Maths";

export interface IStat {
	hash: number;
	definition: DestinyStatDefinition;
	order: StatOrder;
	max?: number;
	bar: boolean;
	value: number;
	intrinsic: number;
	roll: number;
	masterwork: number;
	mod: number;
	subclass: number;
	charge: number;
}

export interface IStats {
	values: Record<number, IStat>;
	block: DestinyItemStatBlockDefinition;
	definition: DestinyStatGroupDefinition;
}

namespace Stats {

	export interface IStatsProfile {
		itemComponents?: DestinyItemComponentSetOfint64;
	}

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

		const intrinsicStats = item.definition.investmentStats;

		const sockets = (await item.sockets) ?? [];
		const statRolls = Socket.filterByPlugs(sockets, "Intrinsic")
			.flatMap(socket => socket.socketedPlug.definition?.investmentStats ?? []);

		const stats = profile.itemComponents?.stats.data?.[item.reference.itemInstanceId!]?.stats ?? item.definition.stats.stats;
		if (stats)
			for (const random of statRolls)
				if (random && !random.isConditionallyActive)
					stats[random.statTypeHash] ??= { statHash: random.statTypeHash, value: random.value };

		const masterworkStats = item.bucket.isCollections() ? [] : Socket.filterByPlugs(sockets, "Masterwork", "Intrinsic/FrameEnhanced")
			.flatMap(socket => socket.socketedPlug.definition?.investmentStats ?? []);

		const modStats = item.bucket.isCollections() ? [] : Socket.filterExcludePlugs(sockets, "Intrinsic", "Masterwork")
			.flatMap(socket => socket.socketedPlug.definition?.investmentStats ?? []);

		const chargeStats = item.bucket.isCollections() ? [] : Socket.filterByPlugs(sockets, "Mod/Armor")
			.flatMap(socket => socket.socketedPlug.getCategorisationAs(DeepsightPlugCategory.Mod)?.armourChargeStats ?? []);

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
				roll: 0,
				mod: 0,
				masterwork: 0,
				subclass: !item.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Subclasses) ? 0 : value,
				charge: 0,
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

			for (const random of statRolls)
				if (hash === random?.statTypeHash && !random.isConditionallyActive)
					stat.roll += random.value;

			for (const masterwork of masterworkStats)
				if (hash === masterwork.statTypeHash && !masterwork.isConditionallyActive)
					stat.masterwork += masterwork.value;

			for (const mod of modStats)
				if (hash === mod?.statTypeHash && !mod.isConditionallyActive)
					stat.mod += mod.value;

			let chargeCount = 0;
			for (const mod of chargeStats)
				if (hash === mod?.statTypeHash)
					stat.charge = typeof mod.value === "number" ? mod.value : mod.value[chargeCount++];

			const { intrinsic, roll, masterwork, mod } = stat;
			stat.intrinsic = interpolate(intrinsic + roll);
			stat.roll = interpolate(roll);
			stat.mod = interpolate(intrinsic + roll + mod) - stat.intrinsic;
			stat.masterwork = interpolate(intrinsic + roll + masterwork) - stat.intrinsic;
		}

		return {
			values: result,
			definition: statGroupDefinition,
			block: item.definition.stats,
		};
	}
}

export default Stats;

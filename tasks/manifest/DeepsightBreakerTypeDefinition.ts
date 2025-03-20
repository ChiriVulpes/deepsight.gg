import { BreakerTypeHashes, InventoryItemHashes, TraitHashes } from "@deepsight.gg/enums";
import type { DeepsightBreakerSourceDefinition } from "@deepsight.gg/interfaces";
import fs from "fs-extra";
import Task from "../utility/Task";
import { BreakerSource } from "./IDeepsightBreakerTypeDefinition";
import manifest from "./utility/endpoint/DestinyManifest";

export default Task("DeepsightBreakerTypeDefinition", async () => {
	const { DestinyInventoryItemDefinition } = manifest;

	function source (breakerTypes: BreakerTypeHashes[], trait?: TraitHashes, appliesTraits?: TraitHashes[]): Omit<DeepsightBreakerSourceDefinition, "hash"> {
		return { trait, appliesTraits, breakerTypes };
	}

	const DeepsightBreakerSourceDefinition: Record<BreakerSource, Omit<DeepsightBreakerSourceDefinition, "hash">> = {
		[BreakerSource.None]: source([]),
		[BreakerSource.IntrinsicShieldPierce]: source([BreakerTypeHashes.ShieldPiercing]),
		[BreakerSource.IntrinsicDisruption]: source([BreakerTypeHashes.Disruption]),
		[BreakerSource.IntrinsicStagger]: source([BreakerTypeHashes.Stagger]),

		[BreakerSource.Blind]: source([BreakerTypeHashes.Stagger], TraitHashes.KeywordsDebuffsArcBlind),
		[BreakerSource.Jolt]: source([BreakerTypeHashes.Disruption], TraitHashes.KeywordsDebuffsArcJolt),

		[BreakerSource.Scorch]: source([BreakerTypeHashes.Stagger], TraitHashes.KeywordsDebuffsSolarScorch, [TraitHashes.KeywordsDebuffsSolarDetonation]),
		[BreakerSource.Ignition]: source([BreakerTypeHashes.Stagger], TraitHashes.KeywordsDebuffsSolarDetonation),
		[BreakerSource.Radiant]: source([BreakerTypeHashes.ShieldPiercing], TraitHashes.KeywordsBuffsSolarEmpower),

		[BreakerSource.VolatileRounds]: source([BreakerTypeHashes.ShieldPiercing], undefined, [TraitHashes.KeywordsDebuffsVoidVolatile]),
		[BreakerSource.Suppress]: source([BreakerTypeHashes.Disruption], TraitHashes.KeywordsDebuffsVoidSuppression),

		[BreakerSource.Slow]: source([BreakerTypeHashes.Disruption, BreakerTypeHashes.Stagger], TraitHashes.KeywordsDebuffsStasisSlow, [TraitHashes.KeywordsDebuffsStasisFreeze]),
		[BreakerSource.Freeze]: source([BreakerTypeHashes.Stagger], TraitHashes.KeywordsDebuffsStasisFreeze),
		[BreakerSource.StasisCrystal]: source([BreakerTypeHashes.Disruption, BreakerTypeHashes.Stagger], TraitHashes.KeywordsBuffsStasisCrystal, [TraitHashes.KeywordsDebuffsStasisSlow, TraitHashes.KeywordsDebuffsStasisFreeze]),

		[BreakerSource.Suspend]: source([BreakerTypeHashes.Stagger], TraitHashes.KeywordsDebuffsStrandSuspend),
		[BreakerSource.UnravelingRounds]: source([BreakerTypeHashes.ShieldPiercing], undefined, [TraitHashes.KeywordsDebuffsStrandInfest]),
	};

	const DeepsightBreakerTypeDefinition: Record<number, BreakerSource[]> = {
		// kinetic exotic weapons
		[InventoryItemHashes.WishKeeperCombatBow]: [BreakerSource.Suspend],
		[InventoryItemHashes.AgersScepterTraceRifle]: [BreakerSource.Slow],
		[InventoryItemHashes.Cryosthesia77kSidearm]: [BreakerSource.Freeze],
		[InventoryItemHashes.WickedImplementScoutRifle]: [BreakerSource.Slow],
		[InventoryItemHashes.ConditionalFinalityShotgun]: [BreakerSource.Freeze, BreakerSource.Ignition],
		[InventoryItemHashes.VerglasCurveCombatBow]: [BreakerSource.StasisCrystal],

		// energy exotic weapons
		[InventoryItemHashes.DelicateTombFusionRifle]: [BreakerSource.Jolt],
		[InventoryItemHashes.EdgeOfActionGlaive]: [BreakerSource.VolatileRounds],
		[InventoryItemHashes.EdgeOfConcurrenceGlaive]: [BreakerSource.Jolt],
		[InventoryItemHashes.ExDirisGrenadeLauncher]: [BreakerSource.Blind],
		[InventoryItemHashes.LodestarTraceRifle]: [BreakerSource.Jolt],
		[InventoryItemHashes.WavesplitterTraceRifle]: [BreakerSource.Suppress],
		[InventoryItemHashes.SlayersFangShotgun]: [BreakerSource.IntrinsicDisruption],

		// power exotic weapons
		[InventoryItemHashes.DeterministicChaosMachineGun]: [BreakerSource.VolatileRounds],
		[InventoryItemHashes.TractorCannonShotgun]: [BreakerSource.Suppress],
		[InventoryItemHashes.GrandOvertureMachineGun]: [BreakerSource.Blind],
		[InventoryItemHashes.DARCISniperRifle]: [BreakerSource.Jolt],
		[InventoryItemHashes.OneThousandVoicesFusionRifle]: [BreakerSource.Scorch],
		[InventoryItemHashes.TwoTailedFoxRocketLauncher]: [BreakerSource.Suppress],
		[InventoryItemHashes.SalvationsGripGrenadeLauncher]: [BreakerSource.Freeze],
		[InventoryItemHashes.TheLamentSword]: [BreakerSource.IntrinsicShieldPierce],
		[InventoryItemHashes.WinterbiteGlaive]: [BreakerSource.Slow],
		[InventoryItemHashes.DragonsBreathRocketLauncher]: [BreakerSource.Scorch],

		// titan armour
		[InventoryItemHashes.SecondChanceGauntlets]: [BreakerSource.IntrinsicShieldPierce],
		[InventoryItemHashes.PointContactCannonBraceGauntlets]: [BreakerSource.IntrinsicDisruption],
		[InventoryItemHashes.HoarfrostZChestArmor]: [BreakerSource.Freeze],

		// hunter armour
		[InventoryItemHashes.AthryssEmbraceGauntlets]: [BreakerSource.IntrinsicStagger],
		[InventoryItemHashes.MothkeepersWrapsGauntlets]: [BreakerSource.Blind],
		[InventoryItemHashes.GiftedConvictionChestArmor]: [BreakerSource.Jolt],
		[InventoryItemHashes.GyrfalconsHauberkChestArmor]: [BreakerSource.VolatileRounds],
		[InventoryItemHashes.LuckyRaspberryChestArmor903984858]: [BreakerSource.IntrinsicDisruption],
		[InventoryItemHashes.TheBombardiersLegArmor]: [BreakerSource.Blind, BreakerSource.Slow, BreakerSource.Suppress],

		// warlock armour
		[InventoryItemHashes.MataiodoxiaChestArmor]: [BreakerSource.IntrinsicShieldPierce, BreakerSource.Suspend],
		[InventoryItemHashes.SecantFilamentsLegArmor]: [BreakerSource.IntrinsicDisruption],
		[InventoryItemHashes.RainOfFireLegArmor]: [BreakerSource.Radiant],

		// normal weapon perks
		[InventoryItemHashes.ChillClipTraitPlug]: [BreakerSource.Slow],
		[InventoryItemHashes.ChillClipEnhancedTraitPlug]: [BreakerSource.Slow],
		[InventoryItemHashes.VoltshotTraitPlug]: [BreakerSource.Jolt],
		[InventoryItemHashes.VoltshotEnhancedTraitPlug]: [BreakerSource.Jolt],
		[InventoryItemHashes.JoltingFeedbackTraitPlug]: [BreakerSource.Jolt],
		[InventoryItemHashes.JoltingFeedbackEnhancedTraitPlug]: [BreakerSource.Jolt],
		[InventoryItemHashes.DestabilizingRoundsTraitPlug]: [BreakerSource.VolatileRounds],
		[InventoryItemHashes.DestabilizingRoundsEnhancedTraitPlug]: [BreakerSource.VolatileRounds],

		// exotic class items
		[InventoryItemHashes.SpiritOfContactIntrinsicPlug]: [BreakerSource.IntrinsicDisruption],
		[InventoryItemHashes.SpiritOfTheGyrfalconIntrinsicPlug]: [BreakerSource.VolatileRounds],
		[InventoryItemHashes.SpiritOfHoarfrostIntrinsicPlug]: [BreakerSource.Freeze],
	};

	const allItems = await DestinyInventoryItemDefinition.all();
	for (const [hashString, definition] of Object.entries(allItems)) {
		const breakerSource = {
			[BreakerTypeHashes.ShieldPiercing]: BreakerSource.IntrinsicShieldPierce,
			[BreakerTypeHashes.Disruption]: BreakerSource.IntrinsicDisruption,
			[BreakerTypeHashes.Stagger]: BreakerSource.IntrinsicStagger,
		}[definition.breakerTypeHash!];
		if (!breakerSource)
			continue;

		const hash = +hashString as InventoryItemHashes;
		DeepsightBreakerTypeDefinition[hash] ??= [];
		DeepsightBreakerTypeDefinition[hash].push(breakerSource);
	}


	await fs.mkdirp("docs/manifest");

	const breakerSources = Object.fromEntries(Object.entries(DeepsightBreakerSourceDefinition)
		.map(([hash, source]) => [parseInt(hash), {
			hash: parseInt(hash),
			...source,
		}]));
	await fs.writeJson("docs/manifest/DeepsightBreakerSourceDefinition.json", breakerSources, { spaces: "\t" });

	const breakerTypes = Object.fromEntries(Object.entries(DeepsightBreakerTypeDefinition)
		.map(([hash, sources]) => [parseInt(hash), {
			hash: parseInt(hash),
			sources,
			types: [...new Set(sources.flatMap(source => DeepsightBreakerSourceDefinition[source].breakerTypes))],
		}]));
	await fs.writeJson("docs/manifest/DeepsightBreakerTypeDefinition.json", breakerTypes, { spaces: "\t" });
});

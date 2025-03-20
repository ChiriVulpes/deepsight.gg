import { BreakerTypeHashes, InventoryItemHashes, TraitHashes } from "@deepsight.gg/enums";
import type { DeepsightBreakerSourceDefinition } from "@deepsight.gg/interfaces";
import fs from "fs-extra";
import Task from "../utility/Task";
import { BreakerSource } from "./IDeepsightBreakerTypeDefinition";
import manifest from "./utility/endpoint/DestinyManifest";

export default Task("DeepsightBreakerTypeDefinition", async () => {
	const { DestinyInventoryItemDefinition } = manifest;

	function source (trait?: TraitHashes, ...breakerTypes: BreakerTypeHashes[]): Omit<DeepsightBreakerSourceDefinition, "hash"> {
		return { trait, breakerTypes };
	}

	const DeepsightBreakerSourceDefinition: Record<BreakerSource, Omit<DeepsightBreakerSourceDefinition, "hash">> = {
		[BreakerSource.None]: source(undefined),
		[BreakerSource.IntrinsicShieldPierce]: source(undefined, BreakerTypeHashes.ShieldPiercing),
		[BreakerSource.IntrinsicDisruption]: source(undefined, BreakerTypeHashes.Disruption),
		[BreakerSource.IntrinsicStagger]: source(undefined, BreakerTypeHashes.Stagger),

		[BreakerSource.Blind]: source(TraitHashes.KeywordsDebuffsArcBlind, BreakerTypeHashes.Stagger),
		[BreakerSource.Jolt]: source(TraitHashes.KeywordsDebuffsArcJolt, BreakerTypeHashes.Disruption),

		[BreakerSource.Scorch]: source(TraitHashes.KeywordsDebuffsSolarScorch, BreakerTypeHashes.Stagger),
		[BreakerSource.Ignition]: source(TraitHashes.KeywordsDebuffsSolarDetonation, BreakerTypeHashes.Stagger),
		[BreakerSource.Radiant]: source(TraitHashes.KeywordsBuffsSolarEmpower, BreakerTypeHashes.ShieldPiercing),

		[BreakerSource.VolatileRounds]: source(undefined, BreakerTypeHashes.ShieldPiercing),
		[BreakerSource.Suppress]: source(TraitHashes.KeywordsDebuffsVoidSuppression, BreakerTypeHashes.Disruption),

		[BreakerSource.Slow]: source(TraitHashes.KeywordsDebuffsStasisSlow, BreakerTypeHashes.Disruption, BreakerTypeHashes.Stagger),
		[BreakerSource.Freeze]: source(TraitHashes.KeywordsDebuffsStasisFreeze, BreakerTypeHashes.Stagger),
		[BreakerSource.StasisCrystal]: source(TraitHashes.KeywordsBuffsStasisCrystal, BreakerTypeHashes.Disruption, BreakerTypeHashes.Stagger),

		[BreakerSource.Suspend]: source(TraitHashes.KeywordsDebuffsStrandSuspend, BreakerTypeHashes.Stagger),
		[BreakerSource.UnravelingRounds]: source(undefined, BreakerTypeHashes.ShieldPiercing),
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
		[InventoryItemHashes.HoarfrostZChestArmor]: [BreakerSource.StasisCrystal],

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
		[InventoryItemHashes.SpiritOfHoarfrostIntrinsicPlug]: [BreakerSource.StasisCrystal],
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

import { BreakerTypeHashes, InventoryItemHashes, TraitHashes } from "@deepsight.gg/enums";
import type { DeepsightBreakerSourceDefinition } from "@deepsight.gg/interfaces";
import fs from "fs-extra";
import { Task } from "task";
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

		[BreakerSource.Slow]: source([BreakerTypeHashes.Disruption], TraitHashes.KeywordsDebuffsStasisSlow),
		[BreakerSource.Freeze]: source([BreakerTypeHashes.Disruption], TraitHashes.KeywordsDebuffsStasisFreeze),
		[BreakerSource.StasisCrystal]: source([BreakerTypeHashes.Disruption], TraitHashes.KeywordsBuffsStasisCrystal, [TraitHashes.KeywordsDebuffsStasisSlow, TraitHashes.KeywordsDebuffsStasisFreeze]),

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
		[InventoryItemHashes.SecondChanceGauntlets1443166262]: [BreakerSource.IntrinsicShieldPierce],
		[InventoryItemHashes.SecondChanceGauntlets4268030601]: [BreakerSource.IntrinsicShieldPierce],
		[InventoryItemHashes.PointContactCannonBraceGauntlets1703598057]: [BreakerSource.IntrinsicDisruption],
		[InventoryItemHashes.PointContactCannonBraceGauntlets308767728]: [BreakerSource.IntrinsicDisruption],
		[InventoryItemHashes.HoarfrostZChestArmor1322544481]: [BreakerSource.Freeze],
		[InventoryItemHashes.HoarfrostZChestArmor4165710258]: [BreakerSource.Freeze],

		// hunter armour
		[InventoryItemHashes.AthryssEmbraceGauntlets2415768376]: [BreakerSource.IntrinsicStagger],
		[InventoryItemHashes.AthryssEmbraceGauntlets89619507]: [BreakerSource.IntrinsicStagger],
		[InventoryItemHashes.MothkeepersWrapsGauntlets3534173884]: [BreakerSource.Blind],
		[InventoryItemHashes.MothkeepersWrapsGauntlets3688534631]: [BreakerSource.Blind],
		[InventoryItemHashes.GiftedConvictionChestArmor1446374842]: [BreakerSource.Jolt],
		[InventoryItemHashes.GiftedConvictionChestArmor1627691271]: [BreakerSource.Jolt],
		[InventoryItemHashes.GyrfalconsHauberkChestArmor2447096246]: [BreakerSource.VolatileRounds],
		[InventoryItemHashes.GyrfalconsHauberkChestArmor461841403]: [BreakerSource.VolatileRounds],
		[InventoryItemHashes.LuckyRaspberryChestArmor1803778317]: [BreakerSource.IntrinsicDisruption],
		[InventoryItemHashes.LuckyRaspberryChestArmor419976111]: [BreakerSource.IntrinsicDisruption],
		[InventoryItemHashes.LuckyRaspberryChestArmor903984858]: [BreakerSource.IntrinsicDisruption],
		[InventoryItemHashes.TheBombardiersLegArmor1219761634]: [BreakerSource.Blind, BreakerSource.Suppress],
		[InventoryItemHashes.TheBombardiersLegArmor2177224557]: [BreakerSource.Blind, BreakerSource.Suppress],

		// warlock armour
		[InventoryItemHashes.MataiodoxiaChestArmor1003391927]: [BreakerSource.IntrinsicShieldPierce, BreakerSource.Suspend],
		[InventoryItemHashes.MataiodoxiaChestArmor1955548646]: [BreakerSource.IntrinsicShieldPierce, BreakerSource.Suspend],
		[InventoryItemHashes.SecantFilamentsLegArmor4029987901]: [BreakerSource.IntrinsicDisruption],
		[InventoryItemHashes.SecantFilamentsLegArmor511888814]: [BreakerSource.IntrinsicDisruption],
		[InventoryItemHashes.RainOfFireLegArmor1624882687]: [BreakerSource.Radiant],
		[InventoryItemHashes.RainOfFireLegArmor511709874]: [BreakerSource.Radiant],

		// normal weapon perks
		[InventoryItemHashes.ChillClipTraitPlug]: [BreakerSource.Slow],
		[InventoryItemHashes.ChillClipEnhancedTraitPlug]: [BreakerSource.Slow],
		[InventoryItemHashes.VoltshotTraitPlug]: [BreakerSource.Jolt],
		[InventoryItemHashes.VoltshotEnhancedTraitPlug]: [BreakerSource.Jolt],
		[InventoryItemHashes.JoltingFeedbackTraitPlug]: [BreakerSource.Jolt],
		[InventoryItemHashes.JoltingFeedbackEnhancedTraitPlug]: [BreakerSource.Jolt],
		[InventoryItemHashes.DestabilizingRoundsTraitPlug]: [BreakerSource.VolatileRounds],
		[InventoryItemHashes.DestabilizingRoundsEnhancedTraitPlug]: [BreakerSource.VolatileRounds],
		[InventoryItemHashes.BurningAmbitionTraitPlug]: [BreakerSource.Scorch],
		[InventoryItemHashes.BurningAmbitionEnhancedTraitPlug]: [BreakerSource.Scorch],

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

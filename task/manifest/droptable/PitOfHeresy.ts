import { ActivityHashes, InventoryItemHashes, RecordHashes } from "@deepsight.gg/Enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.PitOfHeresyStandard,
	displayProperties: {
		icon: { DestinyRecordDefinition: RecordHashes.AMysteriousDisturbance },
	},
	dropTable: {
		[InventoryItemHashes.DreambaneHelmHelmetPlug]: {},
		[InventoryItemHashes.DreambaneGauntletsGauntletsPlug]: {},
		[InventoryItemHashes.DreambanePlateChestArmorPlug]: {},
		[InventoryItemHashes.DreambaneGreavesLegArmorPlug]: {},
		[InventoryItemHashes.DreambaneMarkTitanMarkPlug]: {},

		[InventoryItemHashes.DreambaneCowlHelmetPlug]: {},
		[InventoryItemHashes.DreambaneGripsGauntletsPlug]: {},
		[InventoryItemHashes.DreambaneVestChestArmorPlug]: {},
		[InventoryItemHashes.DreambaneStridesLegArmorPlug]: {},
		[InventoryItemHashes.DreambaneCloakHunterCloakPlug]: {},

		[InventoryItemHashes.DreambaneHoodHelmetPlug]: {},
		[InventoryItemHashes.DreambaneGlovesGauntletsPlug]: {},
		[InventoryItemHashes.DreambaneRobesChestArmorPlug]: {},
		[InventoryItemHashes.DreambaneBootsLegArmorPlug]: {},
		[InventoryItemHashes.DreambaneBondWarlockBondPlug]: {},
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				name: "Descend into the Pit of Heresy",
				description: "Delve below the Scarlet Keep and into the Pit of Heresy.",
			},
		},
		{
			displayProperties: {
				name: "Necropolis",
				description: "Turn the blades of the enemy against them.",
			},
			dropTable: {
				[InventoryItemHashes.ApostateSniperRifle]: { requiresItems: [InventoryItemHashes.HymnOfDesecrationConsumable] },
				[InventoryItemHashes.BlasphemerShotgun]: { requiresItems: [InventoryItemHashes.HymnOfDesecrationConsumable] },
				[InventoryItemHashes.HereticRocketLauncher]: { requiresItems: [InventoryItemHashes.HymnOfDesecrationConsumable] },

				[InventoryItemHashes.EveryWakingMomentSubmachineGun]: {},
				[InventoryItemHashes.LoveAndDeathGrenadeLauncher]: {},
				[InventoryItemHashes.AFineMemorialMachineGun]: {},
				[InventoryItemHashes.OneSmallStepShotgun]: {},
				[InventoryItemHashes.PremonitionPulseRifle]: {},
				[InventoryItemHashes.LoudLullabyHandCannon]: {},
				[InventoryItemHashes.ArcLogicAutoRifle]: {},
				[InventoryItemHashes.DreamBreakerFusionRifle]: {},
				[InventoryItemHashes.TranquilitySniperRifle]: {},
				[InventoryItemHashes.NightTerrorSword]: {},
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Descend into the Pit of Heresy",
				description: "Head toward the Tunnels of Despair.",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Tunnels of Despair",
				description: "Find a way through the Tunnels of Despair.",
			},
		},
		{
			displayProperties: {
				name: "Chamber of Suffering",
				description: "Endure the Chamber of Suffering.",
			},
			dropTable: {
				[InventoryItemHashes.ApostateSniperRifle]: { requiresItems: [InventoryItemHashes.HymnOfDesecrationConsumable] },
				[InventoryItemHashes.BlasphemerShotgun]: { requiresItems: [InventoryItemHashes.HymnOfDesecrationConsumable] },
				[InventoryItemHashes.HereticRocketLauncher]: { requiresItems: [InventoryItemHashes.HymnOfDesecrationConsumable] },

				[InventoryItemHashes.EveryWakingMomentSubmachineGun]: {},
				[InventoryItemHashes.LoveAndDeathGrenadeLauncher]: {},
				[InventoryItemHashes.AFineMemorialMachineGun]: {},
				[InventoryItemHashes.OneSmallStepShotgun]: {},
				[InventoryItemHashes.PremonitionPulseRifle]: {},
				[InventoryItemHashes.LoudLullabyHandCannon]: {},
				[InventoryItemHashes.ArcLogicAutoRifle]: {},
				[InventoryItemHashes.DreamBreakerFusionRifle]: {},
				[InventoryItemHashes.TranquilitySniperRifle]: {},
				[InventoryItemHashes.NightTerrorSword]: {},
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Descend into the Pit of Heresy",
				description: "Descend into the Harrow and survive it.",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "The Harrow",
				description: "The way is shut by dark powers, and the Hive keep it.",
			},
		},
		{
			displayProperties: {
				name: "Zulmak, Instrument of Torment",
				directive: "Purge the tormentor",
				description: "Slay Zulmak, Instrument of Torment.",
			},
		},
		{
			displayProperties: {
				name: "Volmar, the Tempted",
				description: "Defeat Volmar, the Tempted",
			},
			dropTable: {
				[InventoryItemHashes.XenophageMachineGun]: { requiresQuest: InventoryItemHashes.TheJourneyQuestStep_Step4 },
			},
		},
	],
} satisfies DeepsightDropTableDefinition;

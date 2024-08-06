import { ActivityHashes, ActivityModifierHashes, InventoryItemHashes, RecordHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.SalvationsEdgeStandard,
	displayProperties: {
		icon: { DestinyRecordDefinition: RecordHashes.SalvationsEdge2487240675 },
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				name: "Approach Finality",
				description: "Discover a way into the monolith to stop the Witness.",
			},
		},
		{
			phaseHash: 2761002327,
			displayProperties: {
				name: "Substratum",
				directive: "Gain Access to the Monolith",
				description: "Operate the inscrutable machinery to enter the monolith's core.",
			},
			dropTable: {
				[InventoryItemHashes.NullifyPulseRifle_ItemType3]: {},
				[InventoryItemHashes.NonDenouementCombatBow_ItemType3]: {},
				[InventoryItemHashes.ImminenceSubmachineGun_ItemType3]: {},

				// hunter
				[InventoryItemHashes.PromisedReignGripsGauntletsPlug]: {},
				[InventoryItemHashes.PromisedReignVestChestArmorPlug]: {},

				// warlock
				[InventoryItemHashes.PromisedVictoryWrapsGauntletsPlug]: {},
				[InventoryItemHashes.PromisedVictoryRobesChestArmorPlug]: {},

				// titan
				[InventoryItemHashes.PromisedReunionGauntletsGauntletsPlug]: {},
				[InventoryItemHashes.PromisedReunionPlateChestArmorPlug]: {},

			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Enter the Monolith's Core",
				description: "Find a way to ascend the monolith.",
			},
		},
		{
			phaseHash: 193978048,
			displayProperties: {
				name: "Dissipation",
				directive: "Defeat the Herald",
				description: "Remove the Herald of Finality from your path.",
			},
			dropTable: {
				[InventoryItemHashes.SummumBonumSword_ItemType3]: {},
				[InventoryItemHashes.NonDenouementCombatBow_ItemType3]: {},
				[InventoryItemHashes.ForthcomingDevianceGlaive_ItemType3]: {},
				[InventoryItemHashes.ImminenceSubmachineGun_ItemType3]: {},

				// hunter
				[InventoryItemHashes.PromisedReignMaskHelmetPlug]: {},
				[InventoryItemHashes.PromisedReignCloakHunterCloakPlug]: {},

				// warlock
				[InventoryItemHashes.PromisedVictoryHoodHelmetPlug]: {},
				[InventoryItemHashes.PromisedVictoryBondWarlockBondPlug]: {},

				// titan
				[InventoryItemHashes.PromisedReunionHelmHelmetPlug]: {},
				[InventoryItemHashes.PromisedReunionMarkTitanMarkPlug]: {},

			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Ascend the Monolith",
				description: "Progress up the monolith and stop the Witness.",
			},
		},
		{
			phaseHash: 1727550020,
			displayProperties: {
				name: "Repository",
				directive: "Carve A Path",
				description: "Gain access to the Witness.",
			},
			dropTable: {
				[InventoryItemHashes.NullifyPulseRifle_ItemType3]: {},
				[InventoryItemHashes.CriticalAnomalySniperRifle_ItemType3]: {},
				[InventoryItemHashes.ForthcomingDevianceGlaive_ItemType3]: {},

				// hunter
				[InventoryItemHashes.PromisedReignGripsGauntletsPlug]: {},

				// warlock
				[InventoryItemHashes.PromisedVictoryWrapsGauntletsPlug]: {},

				// titan
				[InventoryItemHashes.PromisedReunionGauntletsGauntletsPlug]: {},

			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Ascend the Monolith",
				description: "Continue to ascend the monolith.",
			},
		},
		{
			phaseHash: 637313410,
			displayProperties: {
				name: "Verity",
				directive: "See Beyond",
				description: "Find a path to ascension.",
			},
			dropTable: {
				[InventoryItemHashes.SummumBonumSword_ItemType3]: {},
				[InventoryItemHashes.NonDenouementCombatBow_ItemType3]: {},
				[InventoryItemHashes.ImminenceSubmachineGun_ItemType3]: {},

				// hunter
				[InventoryItemHashes.PromisedReignStridesLegArmorPlug]: {},

				// warlock
				[InventoryItemHashes.PromisedVictoryBootsLegArmorPlug]: {},

				// titan
				[InventoryItemHashes.PromisedReunionGreavesLegArmorPlug]: {},

			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Make Your Final Ascent",
				description: "Climb to the summit and confront the Witness.",
			},
		},
		{
			phaseHash: 4077323831,
			displayProperties: {
				name: "Zenith",
				directive: "Stop the Final Shape",
				description: "Free the Traveler's Light and thwart the Witness's plans.",
			},
			dropTable: {
				[InventoryItemHashes.EuphonyLinearFusionRifle]: {},
				[InventoryItemHashes.SummumBonumSword_ItemType3]: {},
				[InventoryItemHashes.NullifyPulseRifle_ItemType3]: {},
				[InventoryItemHashes.CriticalAnomalySniperRifle_ItemType3]: {},

				// hunter
				[InventoryItemHashes.PromisedReignMaskHelmetPlug]: {},
				[InventoryItemHashes.PromisedReignStridesLegArmorPlug]: {},

				// warlock
				[InventoryItemHashes.PromisedVictoryHoodHelmetPlug]: {},
				[InventoryItemHashes.PromisedVictoryBootsLegArmorPlug]: {},

				// titan
				[InventoryItemHashes.PromisedReunionHelmHelmetPlug]: {},
				[InventoryItemHashes.PromisedReunionGreavesLegArmorPlug]: {},

			},
		},
	],
	rotations: {
		anchor: "2024-06-25T17:00:00Z",
		challenges: [
			ActivityModifierHashes.ScenicRouteChallenge,
			ActivityModifierHashes.AtCapacityChallenge,
			ActivityModifierHashes.BalancedDietChallenge,
			ActivityModifierHashes.VariedGeometryChallenge,
			ActivityModifierHashes.CoordinatedEffortsChallenge,
		],
	},
	master: {
		activityHash: ActivityHashes.SalvationsEdgeMaster,
		dropTable: {
			[InventoryItemHashes.ImminenceAdeptSubmachineGun_ItemType3]: {},
			[InventoryItemHashes.ForthcomingDevianceAdeptGlaive_ItemType3]: {},
			[InventoryItemHashes.NonDenouementAdeptCombatBow_ItemType3]: {},
			[InventoryItemHashes.NullifyAdeptPulseRifle_ItemType3]: {},
			[InventoryItemHashes.CriticalAnomalyAdeptSniperRifle_ItemType3]: {},
			[InventoryItemHashes.SummumBonumAdeptSword_ItemType3]: {},
		},
	},
} satisfies DeepsightDropTableDefinition;

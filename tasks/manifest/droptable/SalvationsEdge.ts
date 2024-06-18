import { ActivityHashes, InventoryItemHashes, RecordHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.SalvationsEdge_Tiern1,
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
			displayProperties: {
				name: "Dissipation",
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
			displayProperties: {
				name: "Repository",
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
			displayProperties: {
				name: "Verity",
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
			displayProperties: {
				name: "Zenith",
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
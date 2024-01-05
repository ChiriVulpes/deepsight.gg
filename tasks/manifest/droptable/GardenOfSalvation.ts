import { ActivityHashes, InventoryItemHashes, RecordHashes } from "../Enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.GardenOfSalvation1042180643,
	displayProperties: {
		icon: { DestinyRecordDefinition: RecordHashes.GardenOfSalvation_PresentationNodeType3 },
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				name: "Track the Unknown Artifact's Signal",
				description: "Enter the Black Garden to track the Unknown Artifact's signal.",
			},
		},
		{
			phaseHash: 2158557525,
			displayProperties: {
				name: "Evade the Consecrated Mind",
				directive: "Track the Unknown Artifact's Signal",
				description: "Evade the Consecrated Mind and continue tracking the Unknown Artifact's signal.",
			},
			dropTable: {
				[InventoryItemHashes.ZealotsRewardFusionRifle]: {},
				[InventoryItemHashes.AccruedRedemptionCombatBow]: {},
				[InventoryItemHashes.GreavesOfAscendancyLegArmorPlug]: {},
				[InventoryItemHashes.StridesOfAscendancyLegArmorPlug]: {},
				[InventoryItemHashes.BootsOfAscendancyLegArmorPlug]: {},
			},
		},
		{
			phaseHash: 473429890,
			traversal: true,
			displayProperties: {
				name: "Track the Unknown Artifact's Signal",
				description: "Make your way through the Undergrowth to continue tracking the Unknown Artifact's signal.",
			},
		},
		{
			phaseHash: 3736477924,
			displayProperties: {
				name: "Summon the Consecrated Mind",
				directive: "Draw out the Consecrated Mind",
				description: "Find a way to draw the Consecrated Mind out of hiding.",
			},
			dropTable: {
				[InventoryItemHashes.ProphetOfDoomShotgun]: {},
				[InventoryItemHashes.RecklessOracleAutoRifle]: {},
				[InventoryItemHashes.GauntletsOfExaltationGauntletsPlug]: {},
				[InventoryItemHashes.GripsOfExaltationGauntletsPlug]: {},
				[InventoryItemHashes.GlovesOfExaltationGauntletsPlug]: {},
			},
		},
		{
			phaseHash: 328479441,
			traversal: true,
			displayProperties: {
				name: "Draw Out the Consecrated Mind",
				description: "Draw out and defeat the Consecrated Mind to continue tracking the Unknown Artifact's signal.",
			},
		},
		{
			phaseHash: 1024471091,
			displayProperties: {
				name: "Consecrated Mind, Sol Inherent",
				directive: "Subdue the Consecrated Mind",
				description: "Defeat the Consecrated Mind to continue tracking the Unknown Artifact's signal.",
			},
			dropTable: {
				[InventoryItemHashes.AncientGospelHandCannon]: {},
				[InventoryItemHashes.SacredProvenancePulseRifle]: {},
				[InventoryItemHashes.PlateOfTranscendenceChestArmorPlug]: {},
				[InventoryItemHashes.VestOfTranscendenceChestArmorPlug]: {},
				[InventoryItemHashes.RobesOfTranscendenceChestArmorPlug]: {},
			},
		},
		{
			phaseHash: 2740950389,
			traversal: true,
			displayProperties: {
				name: "Track the Unknown Artifact's Signal",
				description: "Follow the Unknown Artifact's signal up to the Boundless Horizon to discover where it leads.",
			},
		},
		{
			phaseHash: 523815399,
			displayProperties: {
				name: "Sanctified Mind, Sol Inherent",
				directive: "Defeat the Sanctified Mind",
				description: "Defeat the Sanctified Mind to discover the final destination of the Unknown Artifact's signal.",
			},
			dropTable: {
				[InventoryItemHashes.DivinityTraceRifle]: { requiresQuest: InventoryItemHashes.DivineFragmentationQuestStep_Step3 },
				[InventoryItemHashes.OmniscientEyeSniperRifle]: {},
				[InventoryItemHashes.HelmOfRighteousnessHelmetPlug]: {},
				[InventoryItemHashes.TemptationsMarkTitanMarkPlug]: {},
				[InventoryItemHashes.CowlOfRighteousnessHelmetPlug]: {},
				[InventoryItemHashes.CloakOfTemptationHunterCloakPlug]: {},
				[InventoryItemHashes.MaskOfRighteousnessHelmetPlug]: {},
				[InventoryItemHashes.TemptationsBondWarlockBondPlug]: {},
			},
		},
	],
} satisfies DeepsightDropTableDefinition;

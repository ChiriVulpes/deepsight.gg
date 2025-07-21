import { ActivityHashes, InventoryItemHashes, RecordHashes } from "@deepsight.gg/Enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.GraspOfAvariceStandard,
	displayProperties: {
		icon: { DestinyRecordDefinition: RecordHashes.FatefulSpin },
	},
	dropTable: {
		[InventoryItemHashes.Matador64Shotgun]: {},
		[InventoryItemHashes.HeroOfAgesSword]: {},
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				name: "Investigate the Loot Cave",
				description: "Explore the Loot Cave in search of Wilhelm-7's lost fireteam.",
			},
		},
		{
			phaseHash: 588023047,
			traversal: true,
			displayProperties: {
				name: "Tempt the Icon of Excess",
				description: "Claim Cursed Engrams from combatants and tempt the Icon of Excess.",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Explore the Caves and Facility",
				description: "Push deeper through the caves and the ruined facility.",
			},
		},
		{
			phaseHash: 3362674177,
			traversal: true,
			displayProperties: {
				name: "Navigate the Facility",
				description: "Navigate through the ruins of the facility.",
			},
		},
		{
			phaseHash: 2867024332,
			displayProperties: {
				name: "Phry'zhia, The Insatiable",
				directive: "Defeat Phry'zhia, The Insatiable",
				description: "Turn the cycle of greed against your enemies.",
			},
			dropTable: {
				[InventoryItemHashes.DescendingEchoGreavesLegArmorPlug]: {},
				[InventoryItemHashes.DescendingEchoMarkTitanMarkPlug]: {},
				[InventoryItemHashes.TwistingEchoStridesLegArmorPlug]: {},
				[InventoryItemHashes.TwistingEchoCloakHunterCloakPlug]: {},
				[InventoryItemHashes.CorruptingEchoBootsLegArmorPlug]: {},
				[InventoryItemHashes.CorruptingEchoBondWarlockBondPlug]: {},
			},
		},
		{
			phaseHash: 1049410082,
			traversal: true,
			displayProperties: {
				name: "Continue Through the Ruined Facility",
				description: "Follow Wilhelm-7's path deeper through the wreckage.",
			},
		},
		{
			phaseHash: 2989884184,
			traversal: true,
			displayProperties: {
				name: "Disarm the Mines",
				description: "Reach the mines and disarm them before time runs out.",
			},
		},
		{
			phaseHash: 497054074,
			traversal: true,
			displayProperties: {
				name: "Navigate the Caves",
				description: "Explore the caves to find the source of the Fallen.",
			},
		},
		{
			phaseHash: 4063391552,
			displayProperties: {
				name: "Fallen Shield",
				directive: "Destroy the Shield",
				description: "Fire Servitor remains at the Fallen shield.",
			},
			dropTable: {
				[InventoryItemHashes.DescendingEchoGauntletsGauntletsPlug]: {},
				[InventoryItemHashes.DescendingEchoCageChestArmorPlug]: {},
				[InventoryItemHashes.TwistingEchoGripsGauntletsPlug]: {},
				[InventoryItemHashes.TwistingEchoVestChestArmorPlug]: {},
				[InventoryItemHashes.CorruptingEchoGlovesGauntletsPlug]: {},
				[InventoryItemHashes.CorruptingEchoRobesChestArmorPlug]: {},
			},
		},
		{
			phaseHash: 163634132,
			traversal: true,
			displayProperties: {
				name: "Reach the Great Sphere",
				description: "Find a way to enter the Great Sphere.",
			},
		},
		{
			phaseHash: 4056788414,
			displayProperties: {
				name: "Captain Avarokk the Covetous",
				directive: "Defeat Avarokk the Covetous",
				description: "Turn the cycle of greed against Captain Avarokk the Covetous.",
			},
			dropTable: {
				[InventoryItemHashes.GjallarhornRocketLauncher]: { requiresQuest: InventoryItemHashes.AndOutFlyTheWolvesQuestStep_Step02729195975 },
				[InventoryItemHashes.EyaslunaHandCannon]: {},
				[InventoryItemHashes["1000YardStareSniperRifle"]]: {},

				[InventoryItemHashes.DescendingEchoHelmHelmetPlug]: {},
				[InventoryItemHashes.DescendingEchoGauntletsGauntletsPlug]: {},
				[InventoryItemHashes.DescendingEchoGreavesLegArmorPlug]: {},
				[InventoryItemHashes.DescendingEchoMarkTitanMarkPlug]: {},

				[InventoryItemHashes.TwistingEchoMaskHelmetPlug]: {},
				[InventoryItemHashes.TwistingEchoGripsGauntletsPlug]: {},
				[InventoryItemHashes.TwistingEchoStridesLegArmorPlug]: {},
				[InventoryItemHashes.TwistingEchoCloakHunterCloakPlug]: {},

				[InventoryItemHashes.CorruptingEchoCoverHelmetPlug]: {},
				[InventoryItemHashes.CorruptingEchoGlovesGauntletsPlug]: {},
				[InventoryItemHashes.CorruptingEchoBootsLegArmorPlug]: {},
				[InventoryItemHashes.CorruptingEchoBondWarlockBondPlug]: {},
			},
		},
	],
	master: {
		activityHash: ActivityHashes.GraspOfAvariceMaster_ChallengesLength0,
	},
} satisfies DeepsightDropTableDefinition;

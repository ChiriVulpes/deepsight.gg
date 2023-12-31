import { ActivityHashes, InventoryItemHashes } from "../Enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.GhostsOfTheDeepNormal,
	displayProperties: {
		icon: "./image/png/activity/gotd.png",
	},
	dropTable: {
		[InventoryItemHashes.NoSurvivorsSubmachineGun]: {},
		[InventoryItemHashes.ColdComfortRocketLauncher]: {},
		[InventoryItemHashes.GauntletsOfTheTakenKingGauntletsPlug]: {},
		[InventoryItemHashes.GraspsOfTheTakenKingGauntletsPlug]: {},
		[InventoryItemHashes.GlovesOfTheTakenKingGauntletsPlug]: {},
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				name: "Locate the Ritual Site",
				description: "Find the Lucent Hive ritual site.",
			},
		},
		{
			phaseHash: 160562459, // best guess
			displayProperties: {
				name: "Break the Ritual",
				description: "Unravel the Lucent Hive ritual.",
			},
			dropTable: {
				[InventoryItemHashes.NewPacificEpitaphGrenadeLauncher]: {},
				[InventoryItemHashes.HelmOfTheTakenKingHelmetPlug]: {},
				[InventoryItemHashes.GreavesOfTheTakenKingLegArmorPlug]: {},
				[InventoryItemHashes.MaskOfTheTakenKingHelmetPlug]: {},
				[InventoryItemHashes.StridesOfTheTakenKingLegArmorPlug]: {},
				[InventoryItemHashes.HoodOfTheTakenKingHelmetPlug]: {},
				[InventoryItemHashes.BootsOfTheTakenKingLegArmorPlug]: {},
			},
		},
		{
			phaseHash: 3491633841, // best guess
			traversal: true,
			displayProperties: {
				name: "Explore the Arcology",
				description: "Explore the New Pacific Arcology in search of the Lucent Hive.",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Explore the Arcology",
				description: "Continue deeper into the New Pacific Arcology.",
			},
		},
		{
			phaseHash: 2368968549, // best guess
			traversal: true,
			displayProperties: {
				name: "Dive",
				description: "Reach the seafloor.",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Reach the Wreckage",
				description: "Traverse the seafloor to reach the wrecked Lucent Hive ship.",
			},
		},
		{
			phaseHash: 3040454024, // best guess
			traversal: true,
			displayProperties: {
				name: "Explore the Wreckage",
				description: "Search the depths of the wrecked Lucent Hive ship.",
			},
		},
		{
			phaseHash: 3469402858, // best guess
			displayProperties: {
				name: "Defeat the Shield of Savathûn",
				description: "Defeat Ecthar, the Shield of Savathûn.",
			},
			dropTable: {
				[InventoryItemHashes.GreasyLuckGlaive]: {},
				[InventoryItemHashes.PlateOfTheTakenKingChestArmorPlug]: {},
				[InventoryItemHashes.MarkOfTheTakenKingTitanMarkPlug]: {},
				[InventoryItemHashes.VestOfTheTakenKingChestArmorPlug]: {},
				[InventoryItemHashes.CloakOfTheTakenKingHunterCloakPlug]: {},
				[InventoryItemHashes.VestmentOfTheTakenKingChestArmorPlug]: {},
				[InventoryItemHashes.BondOfTheTakenKingWarlockBondPlug]: {},
			},
		},
		{
			phaseHash: 3828564565, // best guess
			traversal: true,
			displayProperties: {
				name: "Go Deeper",
				description: "Continue exploring the wrecked Hive ship.",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Reach the Ritual Heart",
				description: "Find the source of the Lucent Hive ritual.",
			},
		},
		{
			phaseHash: 2189312851, // best guess
			displayProperties: {
				name: "Defeat Šimmumah ur-Nokru",
				description: "Defeat the lightforged necromancer, Šimmumah ur-Nokru.",
			},
			dropTable: {
				[InventoryItemHashes.NewPacificEpitaphGrenadeLauncher]: {},
				[InventoryItemHashes.GreasyLuckGlaive]: {},
				[InventoryItemHashes.TheNavigatorTraceRifle]: {},
				[InventoryItemHashes.HelmOfTheTakenKingHelmetPlug]: {},
				[InventoryItemHashes.GreavesOfTheTakenKingLegArmorPlug]: {},
				[InventoryItemHashes.MaskOfTheTakenKingHelmetPlug]: {},
				[InventoryItemHashes.StridesOfTheTakenKingLegArmorPlug]: {},
				[InventoryItemHashes.HoodOfTheTakenKingHelmetPlug]: {},
				[InventoryItemHashes.BootsOfTheTakenKingLegArmorPlug]: {},
				[InventoryItemHashes.PlateOfTheTakenKingChestArmorPlug]: {},
				[InventoryItemHashes.MarkOfTheTakenKingTitanMarkPlug]: {},
				[InventoryItemHashes.VestOfTheTakenKingChestArmorPlug]: {},
				[InventoryItemHashes.CloakOfTheTakenKingHunterCloakPlug]: {},
				[InventoryItemHashes.VestmentOfTheTakenKingChestArmorPlug]: {},
				[InventoryItemHashes.BondOfTheTakenKingWarlockBondPlug]: {},
			},
		},
	],
	master: {
		activityHash: ActivityHashes.GhostsOfTheDeepMaster,
	},
} satisfies DeepsightDropTableDefinition;

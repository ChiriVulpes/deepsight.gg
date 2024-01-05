import { ActivityHashes, ActivityModifierHashes, InventoryItemHashes, RecordHashes } from "../Enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.VaultOfGlassNormal,
	displayProperties: {
		icon: { DestinyRecordDefinition: RecordHashes.VaultOfGlass3114569402 },
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				name: "Enter the Vault of Glass",
				description: "Enter the Vault of Glass and face what lies within.",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Raise the Spire",
				description: "Find a way to open the Vault of Glass.",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Delve Further",
				description: "Delve further into the Vault of Glass.",
			},
		},
		{
			phaseHash: 1327839050,
			displayProperties: {
				name: "Confluxes",
				directive: "Defend all three Confluxes",
				description: "Do not let the Vex reach the confluxes.",
			},
			dropTable: {
				[InventoryItemHashes.VisionOfConfluenceScoutRifle]: {},
				[InventoryItemHashes.FoundVerdictShotgun]: {},
				[InventoryItemHashes.CorrectiveMeasureMachineGun]: {},
				[InventoryItemHashes.KabrsBrazenGripsGauntletsPlug]: {},
				[InventoryItemHashes.LightOfTheGreatPrismTitanMarkPlug]: {},
				[InventoryItemHashes.PrimeZealotGlovesGauntletsPlug]: {},
				[InventoryItemHashes.ShatteredVaultCloakHunterCloakPlug]: {},
				[InventoryItemHashes.GlovesOfTheHezenLordsGauntletsPlug]: {},
				[InventoryItemHashes.FragmentOfThePrimeWarlockBondPlug]: {},
			},
		},
		{
			phaseHash: 1327839048,
			displayProperties: {
				name: "Oracles",
				directive: "Destroy the Oracles",
				description: "Silence the Oracles' song.",
			},
			dropTable: {
				[InventoryItemHashes.PraedythsRevengeSniperRifle]: {},
				[InventoryItemHashes.VisionOfConfluenceScoutRifle]: {},
				[InventoryItemHashes.FoundVerdictShotgun]: {},
				[InventoryItemHashes.KabrsBrazenGripsGauntletsPlug]: {},
				[InventoryItemHashes.KabrsForcefulGreavesLegArmorPlug]: {},
				[InventoryItemHashes.PrimeZealotGlovesGauntletsPlug]: {},
				[InventoryItemHashes.PrimeZealotStridesLegArmorPlug]: {},
				[InventoryItemHashes.GlovesOfTheHezenLordsGauntletsPlug]: {},
				[InventoryItemHashes.TreadOfTheHezenLordsLegArmorPlug]: {},
			},
		},
		{
			phaseHash: 1327839049,
			displayProperties: {
				name: "The Templar",
				directive: "Defeat the Templar",
				description: "Defeat the Templar and its legions.",
			},
			dropTable: {
				[InventoryItemHashes.FatebringerHandCannon]: {},
				[InventoryItemHashes.VisionOfConfluenceScoutRifle]: {},
				[InventoryItemHashes.CorrectiveMeasureMachineGun]: {},
				[InventoryItemHashes.KabrsBrazenGripsGauntletsPlug]: {},
				[InventoryItemHashes.KabrsWrathChestArmorPlug]: {},
				[InventoryItemHashes.PrimeZealotGlovesGauntletsPlug]: {},
				[InventoryItemHashes.PrimeZealotCuirassChestArmorPlug]: {},
				[InventoryItemHashes.GlovesOfTheHezenLordsGauntletsPlug]: {},
				[InventoryItemHashes.CuirassOfTheHezenLordsChestArmorPlug]: {},
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "The Great Fall",
				description: "Survive the great fall.",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "The Labyrinth",
				description: "Find a way through the Gorgons' Labyrinth.",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "The Chasm",
				description: "Find a way to cross the chasm and reach the Glass Throne.",
			},
		},
		{
			phaseHash: 3793779770,
			displayProperties: {
				name: "Gatekeepers",
				directive: "Awaken the Glass Throne",
				description: "Protect the timelines and awaken the Glass Throne.",
			},
			dropTable: {
				[InventoryItemHashes.FatebringerHandCannon]: {},
				[InventoryItemHashes.HezenVengeanceRocketLauncher]: {},
				[InventoryItemHashes.FoundVerdictShotgun]: {},
				[InventoryItemHashes.KabrsBattlecageHelmetPlug]: {},
				[InventoryItemHashes.KabrsForcefulGreavesLegArmorPlug]: {},
				[InventoryItemHashes.PrimeZealotMaskHelmetPlug]: {},
				[InventoryItemHashes.PrimeZealotStridesLegArmorPlug]: {},
				[InventoryItemHashes.FacadeOfTheHezenLordsHelmetPlug]: {},
				[InventoryItemHashes.TreadOfTheHezenLordsLegArmorPlug]: {},
			},
		},
		{
			phaseHash: 3793779769,
			displayProperties: {
				name: "Atheon, Time's Conflux",
				directive: "Destroy Atheon",
				description: "Destroy Atheon, Time's Conflux.",
			},
			dropTable: {
				[InventoryItemHashes.PraedythsRevengeSniperRifle]: {},
				[InventoryItemHashes.CorrectiveMeasureMachineGun]: {},
				[InventoryItemHashes.HezenVengeanceRocketLauncher]: {},
				[InventoryItemHashes.VexMythoclastFusionRifle]: {},
				[InventoryItemHashes.KabrsBattlecageHelmetPlug]: {},
				[InventoryItemHashes.KabrsWrathChestArmorPlug]: {},
				[InventoryItemHashes.PrimeZealotMaskHelmetPlug]: {},
				[InventoryItemHashes.PrimeZealotCuirassChestArmorPlug]: {},
				[InventoryItemHashes.FacadeOfTheHezenLordsHelmetPlug]: {},
				[InventoryItemHashes.CuirassOfTheHezenLordsChestArmorPlug]: {},
			},
		},
	],
	master: {
		activityHash: ActivityHashes.VaultOfGlassMaster_ModifiersLength22,
		dropTable: {
			[InventoryItemHashes.FoundVerdictTimelostShotgun]: { purchaseOnly: true },
		},
	},
	rotations: {
		anchor: "2023-10-17T17:00:00Z",
		masterDrops: [
			InventoryItemHashes.FatebringerTimelostHandCannon,
			InventoryItemHashes.HezenVengeanceTimelostRocketLauncher,
			InventoryItemHashes.CorrectiveMeasureTimelostMachineGun,
			InventoryItemHashes.VisionOfConfluenceTimelostScoutRifle,
			InventoryItemHashes.PraedythsRevengeTimelostSniperRifle,
		],
		challenges: [
			ActivityModifierHashes.OutOfItsWay,
			ActivityModifierHashes.StrangersInTime,
			ActivityModifierHashes.EnsemblesRefrain,
			ActivityModifierHashes.WaitForIt,
			ActivityModifierHashes.TheOnlyOracleForYou,
		],
	},
} satisfies DeepsightDropTableDefinition;
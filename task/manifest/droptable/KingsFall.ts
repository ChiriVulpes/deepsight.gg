import { ActivityHashes, ActivityModifierHashes, InventoryItemHashes, RecordHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.KingsFallStandard,
	displayProperties: {
		icon: { DestinyRecordDefinition: RecordHashes.KingsFall3047702042 },
	},
	encounters: [
		{
			phaseHash: 829896467,
			traversal: true,
			displayProperties: {
				name: "Open the Portal",
				description: "Gain access to the Dreadnaught's inner sanctum.",
			},
		},
		{
			phaseHash: 3831927225,
			traversal: true,
			displayProperties: {
				name: "Cross the Expanse",
				description: "Continue traversing the Dreadnaught.",
			},
		},
		{
			phaseHash: 1406613360,
			displayProperties: {
				name: "Basilica",
				directive: "Power the Glyph",
				description: "Power the Hive glyph to lower the barrier and gain deeper access to the Dreadnaught.",
			},
			dropTable: {
				[InventoryItemHashes.DoomOfChelchisScoutRifle]: {},
				[InventoryItemHashes.QullimsTerminusMachineGun]: {},
				[InventoryItemHashes.WarNumensChestChestArmorPlug]: {},
				[InventoryItemHashes.WarNumensBootsLegArmorPlug]: {},
				[InventoryItemHashes.WarNumensMarkTitanMarkPlug]: {},
				[InventoryItemHashes.DarkhollowChitonChestArmorPlug]: {},
				[InventoryItemHashes.DarkhollowTreadsLegArmorPlug]: {},
				[InventoryItemHashes.DarkhollowMantleHunterCloakPlug]: {},
				[InventoryItemHashes.ChasmOfYulChestArmorPlug]: {},
				[InventoryItemHashes.PathOfXolLegArmorPlug]: {},
				[InventoryItemHashes.BondOfTheWormloreWarlockBondPlug]: {},
			},
		},
		{
			phaseHash: 2115142089,
			displayProperties: {
				name: "Warpriest",
				directive: "Defeat the Warpriest",
				description: "Defeat Oryx's Warpriest before he destroys you.",
			},
			dropTable: {
				[InventoryItemHashes.SmiteOfMerainPulseRifle]: {},
				[InventoryItemHashes.DefianceOfYasminSniperRifle]: {},
				[InventoryItemHashes.WarNumensFistGauntletsPlug]: {},
				[InventoryItemHashes.WarNumensChestChestArmorPlug]: {},
				[InventoryItemHashes.DarkhollowGraspsGauntletsPlug]: {},
				[InventoryItemHashes.DarkhollowChitonChestArmorPlug]: {},
				[InventoryItemHashes.GraspOfEirGauntletsPlug]: {},
				[InventoryItemHashes.ChasmOfYulChestArmorPlug]: {},
			},
		},
		{
			phaseHash: 3983340187,
			traversal: true,
			displayProperties: {
				name: "Traverse the Catacombs",
				description: "Find a way out of the Dreadnaught tunnels.",
			},
		},
		{
			phaseHash: 3738629258,
			displayProperties: {
				name: "Golgoroth",
				directive: "Defeat Golgoroth",
				description: "Neutralize the Ogre to advance deeper into the Dreadnaught.",
			},
			dropTable: {
				[InventoryItemHashes.QullimsTerminusMachineGun]: {},
				[InventoryItemHashes.MidhasReckoningFusionRifle]: {},
				[InventoryItemHashes.ZaoulisBaneHandCannon]: {},
				[InventoryItemHashes.WarNumensCrownHelmetPlug]: {},
				[InventoryItemHashes.WarNumensBootsLegArmorPlug]: {},
				[InventoryItemHashes.DarkhollowMaskHelmetPlug]: {},
				[InventoryItemHashes.DarkhollowTreadsLegArmorPlug]: {},
				[InventoryItemHashes.MouthOfUrHelmetPlug]: {},
				[InventoryItemHashes.PathOfXolLegArmorPlug]: {},
			},
		},
		{
			phaseHash: 3897367839,
			traversal: true,
			displayProperties: {
				name: "Traverse the Edge",
				description: "Find Oryx, the Taken King.",
			},
		},
		{
			phaseHash: 2951654489,
			displayProperties: {
				name: "The Daughters",
				directive: "Defeat the Daughters of Oryx",
				description: "Oryx's daughters are his last line of defense. Silence them.",
			},
			dropTable: {
				[InventoryItemHashes.SmiteOfMerainPulseRifle]: {},
				[InventoryItemHashes.DefianceOfYasminSniperRifle]: {},
				[InventoryItemHashes.ZaoulisBaneHandCannon]: {},
				[InventoryItemHashes.WarNumensFistGauntletsPlug]: {},
				[InventoryItemHashes.WarNumensChestChestArmorPlug]: {},
				[InventoryItemHashes.DarkhollowGraspsGauntletsPlug]: {},
				[InventoryItemHashes.DarkhollowChitonChestArmorPlug]: {},
				[InventoryItemHashes.GraspOfEirGauntletsPlug]: {},
				[InventoryItemHashes.ChasmOfYulChestArmorPlug]: {},
			},
		},
		{
			phaseHash: 1089000747,
			displayProperties: {
				name: "Oryx",
				directive: "Defeat Oryx, the Taken King",
				description: "Defeat Oryx to end his threat to the solar system, and to you.",
			},
			dropTable: {
				[InventoryItemHashes.QullimsTerminusMachineGun]: {},
				[InventoryItemHashes.MidhasReckoningFusionRifle]: {},
				[InventoryItemHashes.DoomOfChelchisScoutRifle]: {},
				[InventoryItemHashes.SmiteOfMerainPulseRifle]: {},
				[InventoryItemHashes.DefianceOfYasminSniperRifle]: {},
				[InventoryItemHashes.ZaoulisBaneHandCannon]: {},
				[InventoryItemHashes.TouchOfMaliceScoutRifle]: {},

				[InventoryItemHashes.WarNumensCrownHelmetPlug]: {},
				[InventoryItemHashes.WarNumensFistGauntletsPlug]: {},
				[InventoryItemHashes.DarkhollowMaskHelmetPlug]: {},
				[InventoryItemHashes.DarkhollowGraspsGauntletsPlug]: {},
				[InventoryItemHashes.MouthOfUrHelmetPlug]: {},
				[InventoryItemHashes.GraspOfEirGauntletsPlug]: {},
			},
		},
	],
	master: {
		activityHash: ActivityHashes.KingsFallMaster_Tiern1,
		dropTable: {
			[InventoryItemHashes.QullimsTerminusHarrowedMachineGun]: {},
			[InventoryItemHashes.DoomOfChelchisHarrowedScoutRifle]: {},
			[InventoryItemHashes.ZaoulisBaneHarrowedHandCannon]: {},
			[InventoryItemHashes.MidhasReckoningHarrowedFusionRifle]: {},
			[InventoryItemHashes.SmiteOfMerainHarrowedPulseRifle]: {},
			[InventoryItemHashes.DefianceOfYasminHarrowedSniperRifle]: {},
		},
	},
	rotations: {
		anchor: "2023-10-10T17:00:00Z",
		challenges: [
			ActivityModifierHashes.TheGrassIsAlwaysGreener, // basilica
			ActivityModifierHashes.DeviousThievery, // warpriest
			ActivityModifierHashes.GazeAmaze, // golgoroth
			ActivityModifierHashes.UnderConstruction, // daughters
			ActivityModifierHashes.HandsOff, // oryx
		],
	},
} satisfies DeepsightDropTableDefinition;

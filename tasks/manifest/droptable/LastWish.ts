import { ActivityHashes, InventoryItemHashes, MilestoneHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.LastWishNormal,
	rotationActivityHash: ActivityHashes.LastWishLevel552122313384,
	displayProperties: {
		icon: { DestinyMilestoneDefinition: MilestoneHashes.LastWish },
	},
	dropTable: {
		[InventoryItemHashes.ChatteringBonePulseRifle501329015]: {},
		[InventoryItemHashes.TheSupremacySniperRifle2884596447]: {},
		[InventoryItemHashes.TransfigurationScoutRifle3885259140]: {},
		[InventoryItemHashes.AgeOldBondAutoRifle424291879]: {},
		[InventoryItemHashes.NationOfBeastsHandCannon70083888]: {},
		[InventoryItemHashes.TecheunForceFusionRifle3591141932]: {},
		[InventoryItemHashes.TyrannyOfHeavenCombatBow3388655311]: {},
		[InventoryItemHashes.ApexPredatorRocketLauncher1851777734]: {},

		[InventoryItemHashes.HelmOfTheGreatHuntHelmetPlug]: {},
		[InventoryItemHashes.GauntletsOfTheGreatHuntGauntletsPlug]: {},
		[InventoryItemHashes.PlateOfTheGreatHuntChestArmorPlug]: {},
		[InventoryItemHashes.GreavesOfTheGreatHuntLegArmorPlug]: {},
		[InventoryItemHashes.MarkOfTheGreatHuntTitanMarkPlug]: {},

		[InventoryItemHashes.MaskOfTheGreatHuntHelmetPlug]: {},
		[InventoryItemHashes.GripsOfTheGreatHuntGauntletsPlug]: {},
		[InventoryItemHashes.VestOfTheGreatHuntChestArmorPlug]: {},
		[InventoryItemHashes.StridesOfTheGreatHuntLegArmorPlug]: {},
		[InventoryItemHashes.CloakOfTheGreatHuntHunterCloakPlug]: {},

		[InventoryItemHashes.HoodOfTheGreatHuntHelmetPlug]: {},
		[InventoryItemHashes.GlovesOfTheGreatHuntGauntletsPlug]: {},
		[InventoryItemHashes.RobesOfTheGreatHuntChestArmorPlug]: {},
		[InventoryItemHashes.BootsOfTheGreatHuntLegArmorPlug]: {},
		[InventoryItemHashes.BondOfTheGreatHuntWarlockBondPlug]: {},
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				name: "Enter the Dreaming City",
				description: "Access the Dreaming City and begin your pursuit of Riven, the last known Ahamkara.",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Find Riven",
				description: "Head higher into the Dreaming City and pursue Riven.",
			},
		},
		{
			phaseHash: 1126840038,
			displayProperties: {
				name: "Kalli, the Corrupted",
				directive: "Defeat Kalli",
				description: "Defeat the corrupted Kalli to free her from Taken influence.",
			},
		},
		{
			phaseHash: 3370459802,
			traversal: true,
			displayProperties: {
				name: "Find Riven",
				description: "Head higher into the Dreaming City and pursue Riven.",
			},
		},
		{
			phaseHash: 1040714588,
			displayProperties: {
				name: "Shuro Chi, the Corrupted",
				directive: "Defeat Shuro Chi",
				description: "Defeat the corrupted Shuro Chi to free her from Taken influence.",
			},
		},
		{
			phaseHash: 1349075536,
			traversal: true,
			displayProperties: {
				name: "Find Riven",
				description: "Head higher into the Dreaming City and pursue Riven.",
			},
		},
		{
			phaseHash: 4249034918,
			displayProperties: {
				name: "Morgeth, the Spirekeeper",
				directive: "Defeat Morgeth, the Spirekeeper",
				description: "Defeat Morgeth.",
			},
		},
		{
			phaseHash: 2169047898,
			traversal: true,
			displayProperties: {
				name: "Find Riven",
				description: "Head higher into the Dreaming City and pursue Riven.",
			},
		},
		{
			phaseHash: 436847112,
			displayProperties: {
				name: "The Vault",
				directive: "Unlock the Way Forward",
				description: "Find a way to open the door barring your path.",
			},
		},
		{
			phaseHash: 2879343438,
			traversal: true,
			displayProperties: {
				name: "Find Riven",
				description: "Head higher into the Dreaming City and pursue Riven.",
			},
		},
		{
			phaseHash: 2392610624,
			displayProperties: {
				name: "Riven of a Thousand Voices",
				directive: "Slay Riven",
				description: "Destroy Riven, the last known Ahamkara.",
			},
			dropTable: {
				[InventoryItemHashes.EtherealKeyMaterialDummy]: {},
			},
		},
		{
			phaseHash: 378163510,
			displayProperties: {
				name: "Queenswalk",
				directive: "Take the Stone to the Techeun",
				description: "Escape the spire and get the Heart Stone to the Techeun.",
			},
			dropTable: {
				[InventoryItemHashes.OneThousandVoicesFusionRifle]: { requiresItems: [InventoryItemHashes.EtherealKeyMaterialDummy] },
			},
		},
		// no idea why there's another directive, can't find this in videos
		{
			traversal: true,
			displayProperties: {
				name: "Queenswalk",
				directive: "Deliver the Heart of Wishes",
				description: "Take the Heart of Wishes to the Techeun.",
			},
		},
	],
} satisfies DeepsightDropTableDefinition;

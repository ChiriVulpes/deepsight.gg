import { ActivityHashes, InventoryItemHashes, RecordHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.SpireOfTheWatcherNormal,
	displayProperties: {
		icon: { DestinyRecordDefinition: RecordHashes.SpireOfTheWatcher2302993504 },
	},
	dropTable: {
		[InventoryItemHashes.TerminusHorizonMachineGun]: {},
		[InventoryItemHashes.TmCogburnCustomGauntletsGauntletsPlug]: {},
		[InventoryItemHashes.TmEarpCustomGripsGauntletsPlug]: {},
		[InventoryItemHashes.TmMossCustomGlovesGauntletsPlug]: {},
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				name: "Temporal Disturbance",
				description: "A temporal disturbance crackles with Arc energy, the same type of energy that powers the Seraph complex. A savvy Guardian could utilize this.",
			},
		},
		{
			phaseHash: 3852545214,
			traversal: true,
			displayProperties: {
				name: "Reestablish Power",
				description: "The complex is locked down from the inside out. Continue routing Arc power from the temporal disturbance to open a path into the Seraph complex.",
			},
		},
		{
			phaseHash: 201188049,
			traversal: true,
			displayProperties: {
				name: "Begin the Ascent",
				description: "Venture deeper into the complex and ascend the Spire. Open up a route to the Pillory signal's source.",
			},
		},
		{
			phaseHash: 1483068591,
			displayProperties: {
				name: "Ascend the Spire",
				description: "Open a route via the grav lift to the Spire peak, where the Pillory signal is being sourced.",
			},
			dropTable: {
				[InventoryItemHashes.LongArmScoutRifle]: {},
				[InventoryItemHashes.SeventhSeraphCarbineAutoRifle_IconWatermarkShelvedUndefined]: {},
				[InventoryItemHashes.TmCogburnCustomCoverHelmetPlug]: {},
				[InventoryItemHashes.TmCogburnCustomLegguardsLegArmorPlug]: {},
				[InventoryItemHashes.TmEarpCustomHoodHelmetPlug]: {},
				[InventoryItemHashes.TmEarpCustomChapsLegArmorPlug]: {},
				[InventoryItemHashes.TmMossCustomHatHelmetPlug]: {},
				[InventoryItemHashes.TmMossCustomPantsLegArmorPlug]: {},
			},
		},
		{
			phaseHash: 2027998024,
			traversal: true,
			displayProperties: {
				name: "Ascend the Spire",
				description: "Climb the Spire and reach the source of the Pillory signal.",
			},
		},
		{
			phaseHash: 1779644342,
			displayProperties: {
				name: "Silence the Siren",
				description: "Destroy Akelous, the Siren's Current before it can complete the Pillory protocol and imprison Rasputin's subminds.",
			},
			dropTable: {
				[InventoryItemHashes.SeventhSeraphOfficerRevolverHandCannon_IconWatermarkShelvedUndefined]: {},
				[InventoryItemHashes.TmCogburnCustomPlateChestArmorPlug]: {},
				[InventoryItemHashes.TmCogburnCustomMarkTitanMarkPlug]: {},
				[InventoryItemHashes.TmEarpCustomVestChestArmorPlug]: {},
				[InventoryItemHashes.TmEarpCustomCloakedStetsonHunterCloakPlug]: {},
				[InventoryItemHashes.TmMossCustomDusterChestArmorPlug]: {},
				[InventoryItemHashes.TmMossCustomBondWarlockBondPlug]: {},
			},
		},
		{
			phaseHash: 3603277873,
			traversal: true,
			displayProperties: {
				name: "Descend",
				description: "The Sol Divisive have initiated a reactor meltdown! Descend through the Spire server stack and find a way to stop it.",
			},
		},
		{
			phaseHash: 3934781543,
			traversal: true,
			displayProperties: {
				name: "Pillory Stack Containment",
				description: "The meltdown is triggering lockdowns in the Spire's Pillory server stack. Initiate an override with Arc linkages to negate the lockdowns.",
			},
		},
		{
			phaseHash: 2676434388,
			displayProperties: {
				name: "Prompt Critical",
				description: "Destroy Persys, Primordial Ruin and prevent the complex's reactor core meltdown from causing irreparable damage.",
			},
			dropTable: {
				[InventoryItemHashes.LongArmScoutRifle]: {},
				[InventoryItemHashes.SeventhSeraphCarbineAutoRifle_IconWatermarkShelvedUndefined]: {},
				[InventoryItemHashes.SeventhSeraphOfficerRevolverHandCannon_IconWatermarkShelvedUndefined]: {},
				[InventoryItemHashes.LiminalVigilSidearm]: {},
				[InventoryItemHashes.WilderflightGrenadeLauncher]: {},
				[InventoryItemHashes.HierarchyOfNeedsCombatBow]: {},
				[InventoryItemHashes.TmCogburnCustomCoverHelmetPlug]: {},
				[InventoryItemHashes.TmCogburnCustomPlateChestArmorPlug]: {},
				[InventoryItemHashes.TmCogburnCustomLegguardsLegArmorPlug]: {},
				[InventoryItemHashes.TmCogburnCustomMarkTitanMarkPlug]: {},
				[InventoryItemHashes.TmEarpCustomHoodHelmetPlug]: {},
				[InventoryItemHashes.TmEarpCustomVestChestArmorPlug]: {},
				[InventoryItemHashes.TmEarpCustomChapsLegArmorPlug]: {},
				[InventoryItemHashes.TmEarpCustomCloakedStetsonHunterCloakPlug]: {},
				[InventoryItemHashes.TmMossCustomHatHelmetPlug]: {},
				[InventoryItemHashes.TmMossCustomDusterChestArmorPlug]: {},
				[InventoryItemHashes.TmMossCustomPantsLegArmorPlug]: {},
				[InventoryItemHashes.TmMossCustomBondWarlockBondPlug]: {},
			},
		},
	],
	master: {
		activityHash: ActivityHashes.SpireOfTheWatcherMaster_ModifiersLength16,
	},
} satisfies DeepsightDropTableDefinition;

import { ActivityHashes, InventoryItemHashes } from "@deepsight.gg/Enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.VespersHostNormal,
	displayProperties: {
		icon: "./image/png/activity/vespershost.png",
	},
	dropTable: {
		[InventoryItemHashes.VsGraviticArrestFusionRifle]: {},

		[InventoryItemHashes.SpacewalkBootsLegArmorPlug1025368892]: {},
		[InventoryItemHashes.SpacewalkBootsLegArmorPlug3901727798]: {},
		[InventoryItemHashes.SpacewalkGreavesLegArmorPlug3113666223]: {},
		[InventoryItemHashes.SpacewalkGreavesLegArmorPlug4132376063]: {},
		[InventoryItemHashes.SpacewalkStridesLegArmorPlug1105725465]: {},
		[InventoryItemHashes.SpacewalkStridesLegArmorPlug239405325]: {},
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				directive: "Embarkation",
				description: "Search for a way into Vesper Station.",
			},
		},
		{
			displayProperties: {
				name: "Activation",
				directive: "Reactivate Vesper Station",
				description: "Reactivate station power to open the path ahead.",
			},
			dropTable: {
				[InventoryItemHashes.VsChillInhibitorGrenadeLauncher]: {},
				[InventoryItemHashes.VsVelocityBatonGrenadeLauncher]: {},

				[InventoryItemHashes.SpacewalkPlateChestArmorPlug1615763427]: {},
				[InventoryItemHashes.SpacewalkPlateChestArmorPlug3820841619]: {},
				[InventoryItemHashes.SpacewalkRobesChestArmorPlug4190676582]: {},
				[InventoryItemHashes.SpacewalkRobesChestArmorPlug480133716]: {},
				[InventoryItemHashes.SpacewalkVestChestArmorPlug2436714433]: {},
				[InventoryItemHashes.SpacewalkVestChestArmorPlug3067211509]: {},

				[InventoryItemHashes.SpacewalkGauntletsGauntletsPlug1808327005]: {},
				[InventoryItemHashes.SpacewalkGauntletsGauntletsPlug2867324653]: {},
				[InventoryItemHashes.SpacewalkGlovesGauntletsPlug3234613634]: {},
				[InventoryItemHashes.SpacewalkGlovesGauntletsPlug3255995532]: {},
				[InventoryItemHashes.SpacewalkGraspsGauntletsPlug1364804507]: {},
				[InventoryItemHashes.SpacewalkGraspsGauntletsPlug3592158071]: {},
			},
		},
		{
			traversal: true,
			displayProperties: {
				directive: "Infiltration",
				description: "Continue moving forward through the station to uncover its mysteries.",
			},
		},
		{
			displayProperties: {
				name: "Dismemberment",
				directive: "Defeat Raneiks Unified",
				description: "Find a way to defeat the Unified Servitor.",
			},
			dropTable: {
				[InventoryItemHashes.VsChillInhibitorGrenadeLauncher]: {},
				[InventoryItemHashes.VsPyroelectricPropellantAutoRifle]: {},

				[InventoryItemHashes.SpacewalkHelmHelmetPlug2244013188]: {},
				[InventoryItemHashes.SpacewalkHelmHelmetPlug4036496212]: {},
				[InventoryItemHashes.SpacewalkCoverHelmetPlug1446639859]: {},
				[InventoryItemHashes.SpacewalkCoverHelmetPlug498496285]: {},
				[InventoryItemHashes.SpacewalkCowlHelmetPlug283230886]: {},
				[InventoryItemHashes.SpacewalkCowlHelmetPlug898451378]: {},

				[InventoryItemHashes.SpacewalkGauntletsGauntletsPlug1808327005]: {},
				[InventoryItemHashes.SpacewalkGauntletsGauntletsPlug2867324653]: {},
				[InventoryItemHashes.SpacewalkGlovesGauntletsPlug3234613634]: {},
				[InventoryItemHashes.SpacewalkGlovesGauntletsPlug3255995532]: {},
				[InventoryItemHashes.SpacewalkGraspsGauntletsPlug1364804507]: {},
				[InventoryItemHashes.SpacewalkGraspsGauntletsPlug3592158071]: {},

				[InventoryItemHashes.SpacewalkMarkTitanMarkPlug514586330]: { requiresQuest: InventoryItemHashes.RogueNetworkQuestStep_Step9 },
				[InventoryItemHashes.SpacewalkBondWarlockBondPlug213803727]: { requiresQuest: InventoryItemHashes.RogueNetworkQuestStep_Step9 },
				[InventoryItemHashes.SpacewalkCloakHunterCloakPlug3219219484]: { requiresQuest: InventoryItemHashes.RogueNetworkQuestStep_Step9 },
			},
		},
		{
			traversal: true,
			displayProperties: {
				directive: "Acceleration",
				description: "Make your way closer to the Anomaly to find a way to shut it down.",
			},
		},
		{
			displayProperties: {
				name: "Shutdown",
				directive: "Defeat The Corrupted Puppeteer",
				description: "Take down the Corrupted Puppeteer and stop it from channeling power to the Anomaly.",
			},
			dropTable: {
				[InventoryItemHashes.IceBreakerSniperRifle]: {},
				[InventoryItemHashes.VsVelocityBatonGrenadeLauncher]: {},
				[InventoryItemHashes.VsPyroelectricPropellantAutoRifle]: {},

				[InventoryItemHashes.SpacewalkHelmHelmetPlug2244013188]: {},
				[InventoryItemHashes.SpacewalkHelmHelmetPlug4036496212]: {},
				[InventoryItemHashes.SpacewalkCoverHelmetPlug1446639859]: {},
				[InventoryItemHashes.SpacewalkCoverHelmetPlug498496285]: {},
				[InventoryItemHashes.SpacewalkCowlHelmetPlug283230886]: {},
				[InventoryItemHashes.SpacewalkCowlHelmetPlug898451378]: {},

				[InventoryItemHashes.SpacewalkPlateChestArmorPlug1615763427]: {},
				[InventoryItemHashes.SpacewalkPlateChestArmorPlug3820841619]: {},
				[InventoryItemHashes.SpacewalkRobesChestArmorPlug4190676582]: {},
				[InventoryItemHashes.SpacewalkRobesChestArmorPlug480133716]: {},
				[InventoryItemHashes.SpacewalkVestChestArmorPlug2436714433]: {},
				[InventoryItemHashes.SpacewalkVestChestArmorPlug3067211509]: {},

				// bond only drops class items from dungeon completion on master it seems?
				[InventoryItemHashes.SpacewalkBondWarlockBondPlug1265540521]: { requiresQuest: InventoryItemHashes.RogueNetworkQuestStep_Step9 },
				[InventoryItemHashes.SpacewalkMarkTitanMarkPlug2155757770]: { requiresQuest: InventoryItemHashes.RogueNetworkQuestStep_Step9 },
				[InventoryItemHashes.SpacewalkCloakHunterCloakPlug2147583688]: { requiresQuest: InventoryItemHashes.RogueNetworkQuestStep_Step9 },
			},
		},
	],
	master: {
		activityHash: ActivityHashes.VespersHostMaster,
	},
} satisfies DeepsightDropTableDefinition;

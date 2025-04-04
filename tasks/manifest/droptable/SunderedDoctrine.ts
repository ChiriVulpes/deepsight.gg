import { ActivityHashes, InventoryItemHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.SunderedDoctrineNormal,
	displayProperties: {
		icon: "./image/png/activity/sundereddoctrine.png",
	},
	dropTable: {
		[InventoryItemHashes.UnlovedHandCannon]: {},
		[InventoryItemHashes.UnswornTraceRifle]: {},

		[InventoryItemHashes.MaskOfTheFlainHelmetPlug1274101249]: {},
		[InventoryItemHashes.MaskOfTheFlainHelmetPlug2146870895]: {},
		[InventoryItemHashes.SkullOfTheFlainHelmetPlug267671509]: {},
		[InventoryItemHashes.SkullOfTheFlainHelmetPlug3781388955]: {},
		[InventoryItemHashes.VisageOfTheFlainHelmetPlug2501618648]: {},
		[InventoryItemHashes.VisageOfTheFlainHelmetPlug2549679488]: {},

		[InventoryItemHashes.GraspsOfTheFlainGauntletsPlug2112020760]: {},
		[InventoryItemHashes.GraspsOfTheFlainGauntletsPlug431596278]: {},
		[InventoryItemHashes.GripsOfTheFlainGauntletsPlug3238482084]: {},
		[InventoryItemHashes.GripsOfTheFlainGauntletsPlug945703242]: {},
		[InventoryItemHashes.ReachOfTheFlainGauntletsPlug115752785]: {},
		[InventoryItemHashes.ReachOfTheFlainGauntletsPlug2965319081]: {},

		[InventoryItemHashes.ClawsOfTheFlainLegArmorPlug3897001828]: {},
		[InventoryItemHashes.ClawsOfTheFlainLegArmorPlug874160718]: {},
		[InventoryItemHashes.HooksOfTheFlainLegArmorPlug1643875408]: {},
		[InventoryItemHashes.HooksOfTheFlainLegArmorPlug571745874]: {},
		[InventoryItemHashes.TalonsOfTheFlainLegArmorPlug2791329915]: {},
		[InventoryItemHashes.TalonsOfTheFlainLegArmorPlug4241869859]: {},
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				directive: "Find the Path",
				description: "Make your way to where the Dread are congregating within the Pyramid.",
			},
		},
		{
			displayProperties: {
				name: "The Riddle",
				directive: "Solve the Riddle",
				description: "Cast a light on the mysteries of the Pyramid.",
			},
			dropTable: {
				[InventoryItemHashes.UnworthyScoutRifle]: {},
			},
		},
		{
			traversal: true,
			displayProperties: {
				directive: "Navigate the Maze",
				description: "Find your way through the labyrinth.",
			},
		},
		{
			displayProperties: {
				name: "Zoetic Lockset",
				directive: "Open the Locks",
				description: "Unbar your way forward.",
			},
			dropTable: {
				[InventoryItemHashes.UnvoicedShotgun]: {},
			},
		},
		{
			traversal: true,
			displayProperties: {
				directive: "Locate the Vault",
				description: "Seek the Dread at the end of Rhulk's storehouses and laboratories.",
			},
		},
		{
			displayProperties: {
				name: "Kerrev, the Erased",
				directive: "Defeat Kerrev, the Erased",
				description: "Stop the dread from opening the vault door.",
			},
			dropTable: {
				[InventoryItemHashes.UnvoicedShotgun]: {},
				[InventoryItemHashes.UnworthyScoutRifle]: {},
				[InventoryItemHashes.FinalitysAugerLinearFusionRifle]: {},

				[InventoryItemHashes.AdornmentOfTheFlainChestArmorPlug2299285295]: {},
				[InventoryItemHashes.AdornmentOfTheFlainChestArmorPlug3300886791]: {},
				[InventoryItemHashes.CarapaceOfTheFlainChestArmorPlug380371582]: {},
				[InventoryItemHashes.CarapaceOfTheFlainChestArmorPlug608948636]: {},
				[InventoryItemHashes.ScalesOfTheFlainChestArmorPlug2578940720]: {},
				[InventoryItemHashes.ScalesOfTheFlainChestArmorPlug4052335546]: {},

				[InventoryItemHashes.WeaversBondWarlockBondPlug187348246]: { requiresQuest: InventoryItemHashes.TheDrowningLabyrinthQuestStep_Step10 },
				[InventoryItemHashes.WeaversBondWarlockBondPlug4012478142]: { requiresQuest: InventoryItemHashes.TheDrowningLabyrinthQuestStep_Step10 },
				[InventoryItemHashes.AttendantsMarkTitanMarkPlug2319342865]: { requiresQuest: InventoryItemHashes.TheDrowningLabyrinthQuestStep_Step10 },
				[InventoryItemHashes.AttendantsMarkTitanMarkPlug4004965895]: { requiresQuest: InventoryItemHashes.TheDrowningLabyrinthQuestStep_Step10 },
				[InventoryItemHashes.HusksCloakHunterCloakPlug1930656621]: { requiresQuest: InventoryItemHashes.TheDrowningLabyrinthQuestStep_Step10 },
				[InventoryItemHashes.HusksCloakHunterCloakPlug3276331403]: { requiresQuest: InventoryItemHashes.TheDrowningLabyrinthQuestStep_Step10 },
			},
		},
	],
	master: {
		activityHash: ActivityHashes.SunderedDoctrineMaster,
	},
} satisfies DeepsightDropTableDefinition;

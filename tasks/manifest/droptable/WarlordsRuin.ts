import { ActivityHashes, InventoryItemHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.WarlordsRuinStandard,
	displayProperties: {
		icon: "./image/png/activity/warlords.png",
	},
	dropTable: {
		[InventoryItemHashes.IndebtedKindnessSidearm]: {},
		[InventoryItemHashes.DarkAgeGripsGauntletsPlug1316592242]: {},
		[InventoryItemHashes.DarkAgeGlovesGauntletsPlug2572175997]: {},
		[InventoryItemHashes.DarkAgeGauntletsGauntletsPlug652593750]: {},
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				name: "The Climb",
				description: "You've arrived at the end of a trail of Dark Ether. Press forward, climb the ridgeline path, and discover what remains hidden in stormy peaks.",
			},
		},
		{
			phaseHash: 2065920306,
			displayProperties: {
				name: "Mysterious Challenger",
				description: "A corrupted Knight stands between you and answers. Meet their challenge, leave them broken, but beware latent curses.",
			},
			dropTable: {
				[InventoryItemHashes.VengefulWhisperCombatBow]: {},
				[InventoryItemHashes.DragoncultSickleSword]: {},

				// hunter
				[InventoryItemHashes.DarkAgeMaskHelmetPlug220527011]: {},
				[InventoryItemHashes.DarkAgeStridesLegArmorPlug1717830540]: {},

				// warlock
				[InventoryItemHashes.DarkAgeVisorHelmetPlug3007862180]: {},
				[InventoryItemHashes.DarkAgeLegbracesLegArmorPlug601360799]: {},

				// titan
				[InventoryItemHashes.DarkAgeHelmHelmetPlug2792429007]: {},
				[InventoryItemHashes.DarkAgeSabatonsLegArmorPlug1864873008]: {},
			},
		},
		{
			phaseHash: 3236820808,
			traversal: true,
			displayProperties: {
				name: "Imprisoned!",
				description: "A dying wish has imprisoned you within a ruined cell. Use your wits, and find a method of escape.",
			},
		},
		{
			phaseHash: 3446399378,
			traversal: true,
			displayProperties: {
				name: "Venture Deeper",
				description: "The Scorn are numerous, but a whisper still calls from deeper within the castle. Press on, across the ramparts, O vengeance mine.",
			},
		},
		{
			phaseHash: 3561038507,
			traversal: true,
			displayProperties: {
				name: "Buried Ruins",
				description: "Navigate the ruined undercroft of the castle, and mind your footing.",
			},
		},
		{
			phaseHash: 2152475930,
			traversal: true,
			displayProperties: {
				name: "Outward",
				description: "Find a path outside; search for and uncover a long-defunct entrance to the main castle grounds.",
			},
		},
		{
			phaseHash: 1306680929,
			displayProperties: {
				name: "Wailing Tempest",
				description: "Wish for warmth, brave the frigid winds, and silence the Locus of Wailing Grief that sustains them.",
			},
			dropTable: {
				[InventoryItemHashes.NaeemsLanceSniperRifle]: {},
				[InventoryItemHashes.VengefulWhisperCombatBow]: {},

				// hunter
				[InventoryItemHashes.DarkAgeHarnessChestArmorPlug1450838966]: {},
				[InventoryItemHashes.DarkAgeCloakHunterCloakPlug822042719]: {},

				// warlock
				[InventoryItemHashes.DarkAgeOvercoatChestArmorPlug787709443]: {},
				[InventoryItemHashes.DarkAgeBondWarlockBondPlug3981499770]: {},

				// titan
				[InventoryItemHashes.DarkAgeChestrigChestArmorPlug3788388762]: {},
				[InventoryItemHashes.DarkAgeMarkTitanMarkPlug3012281579]: {},
			},
		},
		{
			phaseHash: 1531676752,
			traversal: true,
			displayProperties: {
				name: "Follow the Whispers",
				description: "The whispers grow stronger. Their grief quelled, their vengeance almost sated. All that remains is to end the source of this corruption.",
			},
		},
		{
			phaseHash: 3742397155,
			traversal: true,
			displayProperties: {
				name: "Vengeful Peak",
				description: "Discover the source of the Scorn, the whispers, and cleanse the Keep of corruption.",
			},
		},
		{
			phaseHash: 2741345805,
			displayProperties: {
				name: "Quell the Corruption",
				description: "\"You have taken my vengeance. My task is done, Naeem's wish fulfilled. Come then, slay me. Let it end.\" —Hefnd",
			},
			dropTable: {
				[InventoryItemHashes.NaeemsLanceSniperRifle]: {},
				[InventoryItemHashes.DragoncultSickleSword]: {},
				[InventoryItemHashes.BuriedBloodlineSidearm]: {},

				// hunter
				[InventoryItemHashes.DarkAgeMaskHelmetPlug220527011]: {},
				[InventoryItemHashes.DarkAgeHarnessChestArmorPlug1450838966]: {},
				[InventoryItemHashes.DarkAgeStridesLegArmorPlug1717830540]: {},
				[InventoryItemHashes.DarkAgeCloakHunterCloakPlug822042719]: {},

				// warlock
				[InventoryItemHashes.DarkAgeVisorHelmetPlug3007862180]: {},
				[InventoryItemHashes.DarkAgeOvercoatChestArmorPlug787709443]: {},
				[InventoryItemHashes.DarkAgeLegbracesLegArmorPlug601360799]: {},
				[InventoryItemHashes.DarkAgeBondWarlockBondPlug3981499770]: {},

				// titan
				[InventoryItemHashes.DarkAgeHelmHelmetPlug2792429007]: {},
				[InventoryItemHashes.DarkAgeChestrigChestArmorPlug3788388762]: {},
				[InventoryItemHashes.DarkAgeSabatonsLegArmorPlug1864873008]: {},
				[InventoryItemHashes.DarkAgeMarkTitanMarkPlug3012281579]: {},
			},
		},
	],
	master: {
		activityHash: ActivityHashes.WarlordsRuinMaster,
	},
} satisfies DeepsightDropTableDefinition;

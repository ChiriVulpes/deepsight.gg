import { ActivityHashes, InventoryItemHashes, RecordHashes } from "@deepsight.gg/Enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.TheShatteredThrone,
	displayProperties: {
		icon: { DestinyRecordDefinition: RecordHashes.DarkMonastery },
	},
	dropTable: {
		[InventoryItemHashes.AbideTheReturnSword_QualityVersionsLength2]: {},
		[InventoryItemHashes.RetoldTaleShotgun_QualityVersionsLength2]: {},
		[InventoryItemHashes.SleeplessRocketLauncher_QualityVersionsLength2]: {},
		[InventoryItemHashes.TigerspiteAutoRifle_QualityVersionsLength2]: {},
		[InventoryItemHashes.TwilightOathSniperRifle_QualityVersionsLength2]: {},
		[InventoryItemHashes.VouchsafeScoutRifle_QualityVersionsLength2]: {},
		[InventoryItemHashes.WakingVigilHandCannon_QualityVersionsLength2]: {},

		[InventoryItemHashes.ReverieDawnHelmHelmetPlug1472713738]: {},
		[InventoryItemHashes.ReverieDawnGauntletsGauntletsPlug1478378067]: {},
		[InventoryItemHashes.ReverieDawnPlateChestArmorPlug2561756285]: {},
		[InventoryItemHashes.ReverieDawnGreavesLegArmorPlug788771493]: {},
		[InventoryItemHashes.ReverieDawnMarkTitanMarkPlug4023744176]: {},

		[InventoryItemHashes.ReverieDawnCasqueHelmetPlug2804026582]: {},
		[InventoryItemHashes.ReverieDawnGraspsGauntletsPlug4008120231]: {},
		[InventoryItemHashes.ReverieDawnHauberkChestArmorPlug3368092113]: {},
		[InventoryItemHashes.ReverieDawnStridesLegArmorPlug3185383401]: {},
		[InventoryItemHashes.ReverieDawnCloakHunterCloakPlug844097260]: {},

		[InventoryItemHashes.ReverieDawnHoodHelmetPlug1076538039]: {},
		[InventoryItemHashes.ReverieDawnGlovesGauntletsPlug150052158]: {},
		[InventoryItemHashes.ReverieDawnTabardChestArmorPlug757360370]: {},
		[InventoryItemHashes.ReverieDawnBootsLegArmorPlug569434520]: {},
		[InventoryItemHashes.ReverieDawnBondWarlockBondPlug1394177923]: {},
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				name: "Cross the Ascendant Plane",
				description: "\"A throne world, shattered…\"",
			},
		},
		{
			displayProperties: {
				name: "Search for safe passage",
				description: "\"Show me your cunning…\"",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Journey to the spire",
				description: "\"There is no place better suited for you…\"",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Press onward",
				description: "\"Her plan will never come to pass…\"",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Cross the chasm",
				description: "\"Look down. Listen to the Deep call to you…\"",
			},
		},
		{
			displayProperties: {
				name: "Vorgeth, the Boundless Hunger",
				directive: "Overcome the Keeper of Petitions",
				description: "\"Shape your schemes into reality…\"",
			},
			dropTable: {
				[InventoryItemHashes.WishEnderCombatBow]: {
					requiresQuest: InventoryItemHashes.HuntersRemembranceQuestStep_Step2,
					requiresItems: [
						InventoryItemHashes.WakingTokenOfQuerimDummy_ItemType0,
						InventoryItemHashes.WakingTokenOfEriviksDummy_ItemType0,
						InventoryItemHashes.WakingTokenOfXavothDummy_ItemType0,
					],
				},
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Press onward",
				description: "\"Come closer…\"",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Ascend",
				description: "\"Doomed are the hesitant…\"",
			},
		},
		{
			displayProperties: {
				name: "Dûl Incaru, the Eternal Return",
				directive: "Face Dûl Incaru",
				description: "\"Enter the infinite…\"",
			},
		},
	],
} satisfies DeepsightDropTableDefinition;

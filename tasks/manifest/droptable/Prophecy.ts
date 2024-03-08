import { ActivityHashes, InventoryItemHashes, RecordHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.Prophecy_ChallengesLength0,
	rotationActivityHash: ActivityHashes.Prophecy_ChallengesLength1,
	displayProperties: {
		icon: { DestinyRecordDefinition: RecordHashes.ProphecyComplete872886548 },
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				name: "Seek the Nine",
				description: "Seek an audience with the Nine.",
			},
		},
		{
			phaseHash: 2400102494,
			displayProperties: {
				name: "Defeat the Phalanx Echo",
				description: "Confront the Phalanx Echo, a part of the Nine's answer to your question.",
			},
			dropTable: {
				[InventoryItemHashes.ProsecutorAutoRifle_IconWatermarkShelvedUndefined]: {},
				[InventoryItemHashes.RelentlessPulseRifle_IconWatermarkShelvedUndefined]: {},
				[InventoryItemHashes.CrushingGreavesCodaLegArmorPlug]: {},
				[InventoryItemHashes.MarkJudgmentCodaTitanMarkPlug]: {},
				[InventoryItemHashes.FlowingBootsCodaLegArmorPlug]: {},
				[InventoryItemHashes.CloakJudgmentCodaHunterCloakPlug]: {},
				[InventoryItemHashes.ChannelingTreadsCodaLegArmorPlug]: {},
				[InventoryItemHashes.BondJudgmentCodaWarlockBondPlug]: {},
			},
		},
		{
			phaseHash: 1692344396,
			traversal: true,
			displayProperties: {
				name: "Sink",
				description: "Descend.",
			},
		},
		{
			phaseHash: 382168380,
			traversal: true,
			displayProperties: {
				name: "Wasteland",
				description: "Navigate the expanse of the wasteland.",
			},
		},
		{
			phaseHash: 2132736886,
			traversal: true,
			displayProperties: {
				name: "Escape the Wasteland",
				description: "Traverse deeper into this realm of the Nine.",
			},
		},
		{
			phaseHash: 3585780724,
			displayProperties: {
				name: "Escape",
				description: "Find a way forward.",
			},
			dropTable: {
				[InventoryItemHashes.AdjudicatorSubmachineGun_IconWatermarkShelvedUndefined]: {},
				[InventoryItemHashes.ASuddenDeathShotgun4097972038]: {},
				[InventoryItemHashes.CrushingGuardCodaGauntletsPlug]: {},
				[InventoryItemHashes.FlowingGripsCodaGauntletsPlug]: {},
				[InventoryItemHashes.ChannelingWrapsCodaGauntletsPlug]: {},
			},
		},
		{
			phaseHash: 3999204422,
			traversal: true,
			displayProperties: {
				name: "Return to the Wasteland",
				description: "Cross the wasteland once more.",
			},
		},
		{
			phaseHash: 2229343072,
			traversal: true,
			displayProperties: {
				name: "Deadsea",
				description: "Traverse the sea.",
			},
		},
		{
			phaseHash: 2543744318,
			traversal: true,
			displayProperties: {
				name: "Traverse Deeper",
				description: "Face the final answer to your question.",
			},
		},
		{
			phaseHash: 3492117941,
			displayProperties: {
				name: "Defeat the Kell Echo",
				description: "Confront the Kell Echo, a part of the Nine's answer to your question.",
			},
			dropTable: {
				[InventoryItemHashes.JudgmentHandCannon2969415423]: {},
				[InventoryItemHashes.DarkestBeforePulseRifle435821040]: {},
				[InventoryItemHashes.CrushingHelmCodaHelmetPlug]: {},
				[InventoryItemHashes.CrushingPlateCodaChestArmorPlug]: {},
				[InventoryItemHashes.MarkJudgmentCodaTitanMarkPlug]: {},
				[InventoryItemHashes.MoonfangX7HelmHelmetPlug]: {},
				[InventoryItemHashes.MoonfangX7GauntletsGauntletsPlug]: {},
				[InventoryItemHashes.MoonfangX7ChassisChestArmorPlug]: {},
				[InventoryItemHashes.MoonfangX7GreavesLegArmorPlug]: {},
				[InventoryItemHashes.MoonfangX7MarkTitanMarkPlug]: {},
				[InventoryItemHashes.FlowingCowlCodaHelmetPlug]: {},
				[InventoryItemHashes.FlowingVestCodaChestArmorPlug]: {},
				[InventoryItemHashes.CloakJudgmentCodaHunterCloakPlug]: {},
				[InventoryItemHashes.MoonfangX7MaskHelmetPlug]: {},
				[InventoryItemHashes.MoonfangX7GripsGauntletsPlug]: {},
				[InventoryItemHashes.MoonfangX7RigChestArmorPlug]: {},
				[InventoryItemHashes.MoonfangX7StridesLegArmorPlug]: {},
				[InventoryItemHashes.MoonfangX7CloakHunterCloakPlug]: {},
				[InventoryItemHashes.ChannelingCowlCodaHelmetPlug]: {},
				[InventoryItemHashes.ChannelingRobesCodaChestArmorPlug]: {},
				[InventoryItemHashes.BondJudgmentCodaWarlockBondPlug]: {},
				[InventoryItemHashes.MoonfangX7CrownHelmetPlug]: {},
				[InventoryItemHashes.MoonfangX7GlovesGauntletsPlug]: {},
				[InventoryItemHashes.MoonfangX7BootsLegArmorPlug]: {},
				[InventoryItemHashes.MoonfangX7BondWarlockBondPlug]: {},
			},
		},
		{
			phaseHash: 3998734759,
			traversal: true,
			displayProperties: {
				name: "Receive the Answer",
				description: "Collect your reward from the Nine.",
			},
		},
	],
} satisfies DeepsightDropTableDefinition;

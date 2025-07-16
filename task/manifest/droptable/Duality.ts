import { ActivityHashes, InventoryItemHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
	hash: ActivityHashes.DualityStandard,
	// displayProperties: {
	// 	icon: { DestinyRecordDefinition: RecordHashes.Duality3097916612 },
	// },
	dropTable: {
		[InventoryItemHashes.DeepExplorerGauntletsGauntletsPlug]: {},
		[InventoryItemHashes.DeepExplorerGraspsGauntletsPlug]: {},
		[InventoryItemHashes.DeepExplorerGlovesGauntletsPlug]: {},
	},
	encounters: [
		{
			traversal: true,
			displayProperties: {
				name: "Enter the Echo of Calus's Consciousness",
				description: "\"Once, I stood out overlooking a vast plain. Wildflowers and nettles blossomed at my feet. The future was full of promise and potential. Yet I upturned an overflowing chalice of shame at my feet, and let it puddle into rot.\"",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Navigate the Mindscape",
				description: "\"…and here, you see, etched on the bell? That is when I attained the title of emperor and began a thousand years of peace.\"",
			},
		},
		{
			displayProperties: {
				name: "Sorrow Bearer",
				directive: "Defeat the Nightmare of Gahlran",
				description: "\"You were born only to suffer, because I could not set aside that which I knew was a trap. My curiosity is a poison flowing through my veins, curdling my heart, rotting my mind. And yet, I do nothing to stop it.\"",
			},
			dropTable: {
				[InventoryItemHashes.LingeringDreadGrenadeLauncher]: {},
				[InventoryItemHashes.TheEpicureanFusionRifle_TooltipNotificationsLength3]: {},
				[InventoryItemHashes.DeepExplorerHelmetHelmetPlug]: {},
				[InventoryItemHashes.DeepExplorerGreavesLegArmorPlug]: {},
				[InventoryItemHashes.DeepExplorerMaskHelmetPlug]: {},
				[InventoryItemHashes.DeepExplorerStridesLegArmorPlug]: {},
				[InventoryItemHashes.DeepExplorerHoodHelmetPlug]: {},
				[InventoryItemHashes.DeepExplorerBootsLegArmorPlug]: {},
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Dive Deeper",
				description: "\"Her memory curdles in my chest. Her first laugh, her first steps, her first kill. Poison. Poison. Poison.\"",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Navigate the Crypt",
				description: "\"I defiled them. The remains of countless dead. Honored servants of the empire, extended members of my lineage. I ripped their tombs open to harvest their genetic information… to build an army of unquestioning soldiers. What have I become?\"",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Find the Way",
				description: "\"I should have killed every member of the old guard when I had the chance. Mercy was my greatest failing, and they used mercy's edge to cut me down to my knees.\"",
			},
		},
		{
			displayProperties: {
				name: "Vault",
				directive: "Unlock the Vault",
				description: "\"I beg you, don't do this.\"",
			},
			dropTable: {
				[InventoryItemHashes.StormchaserLinearFusionRifle]: {},
				[InventoryItemHashes.UnforgivenSubmachineGun]: {},
				[InventoryItemHashes.DeepExplorerPlateChestArmorPlug]: {},
				[InventoryItemHashes.DeepExplorerMarkTitanMarkPlug]: {},
				[InventoryItemHashes.DeepExplorerVestChestArmorPlug]: {},
				[InventoryItemHashes.DeepExplorerCloakHunterCloakPlug]: {},
				[InventoryItemHashes.DeepExplorerVestmentsChestArmorPlug]: {},
				[InventoryItemHashes.DeepExplorerBondWarlockBondPlug]: {},
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Enter the Vault",
				description: "\"It hurts. It hurts. It hurts. It hurts.\"",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Navigate the Vault",
				description: "\"Cut it away. A knife through memory's flesh. Peel back what I was and replace it with scalding gold. I do not want this. I do not want this. I do not want this.\"",
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: "Enter the Dark Shrine",
				description: "\"For once in my life, I do not feel shame. I feel the caress of a thousand hands, hear the comforting hush of a thousand voices. 'Do not be afraid,' it whispers. 'We are your salvation.' Yes. Please. Save me from myself.\"",
			},
		},
		{
			displayProperties: {
				name: "Calus's Greatest Shame",
				directive: "Defeat the Nightmare of Princess Caiatl",
				description: "\"Is this what I have done? Once, she looked at me with adoring eyes. I was her world, and she my stars. How have I made her into this? Have I been so blind? So selfish? What have I done?\"",
			},
			dropTable: {
				[InventoryItemHashes.LingeringDreadGrenadeLauncher]: {},
				[InventoryItemHashes.TheEpicureanFusionRifle_TooltipNotificationsLength3]: {},
				[InventoryItemHashes.DeepExplorerHelmetHelmetPlug]: {},
				[InventoryItemHashes.DeepExplorerGreavesLegArmorPlug]: {},
				[InventoryItemHashes.DeepExplorerMaskHelmetPlug]: {},
				[InventoryItemHashes.DeepExplorerStridesLegArmorPlug]: {},
				[InventoryItemHashes.DeepExplorerHoodHelmetPlug]: {},
				[InventoryItemHashes.DeepExplorerBootsLegArmorPlug]: {},
				[InventoryItemHashes.StormchaserLinearFusionRifle]: {},
				[InventoryItemHashes.UnforgivenSubmachineGun]: {},
				[InventoryItemHashes.DeepExplorerPlateChestArmorPlug]: {},
				[InventoryItemHashes.DeepExplorerMarkTitanMarkPlug]: {},
				[InventoryItemHashes.DeepExplorerVestChestArmorPlug]: {},
				[InventoryItemHashes.DeepExplorerCloakHunterCloakPlug]: {},
				[InventoryItemHashes.DeepExplorerVestmentsChestArmorPlug]: {},
				[InventoryItemHashes.DeepExplorerBondWarlockBondPlug]: {},
				[InventoryItemHashes.NewPurposePulseRifle]: {},
				[InventoryItemHashes.FixedOddsMachineGun_TooltipNotificationsLength3]: {},
				[InventoryItemHashes.HeartshadowSword]: {},
			},
		},
	],
	master: {
		activityHash: ActivityHashes.DualityMaster_ModifiersLength17,
	},
} satisfies DeepsightDropTableDefinition;

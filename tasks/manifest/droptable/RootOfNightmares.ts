import { ActivityHashes, ActivityModifierHashes, InventoryItemHashes, RecordHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
    hash: ActivityHashes.RootOfNightmaresNormal,
    displayProperties: {
        icon: { DestinyRecordDefinition: RecordHashes.RootOfNightmares4270724598 },
    },
    encounters: [
        {
            phaseHash: 1326836846, // best guess
            traversal: true,
            displayProperties: {
                name: "Find Nezarec",
                description: "Locate Nezarec's body in its encasement.",
            },
        },
        {
            phaseHash: 3172054256,
            displayProperties: {
                name: "Cataclysm",
                directive: "Survive the Onslaught",
                description: "Fight for control and stay alive.",
            },
            dropTable: {
                [InventoryItemHashes.BriarsContemptLinearFusionRifle_ItemType3]: {},
                [InventoryItemHashes.KoraxissDistressGrenadeLauncher_ItemType3]: {},
                [InventoryItemHashes.NessasOblationShotgun_ItemType3]: {},

                // hunter
                [InventoryItemHashes.MaskOfTrepidationHelmetPlug]: {},
                [InventoryItemHashes.GripsOfTrepidationGauntletsPlug]: {},
                [InventoryItemHashes.VestOfTrepidationChestArmorPlug]: {},

                // warlock
                [InventoryItemHashes.MaskOfDetestationHelmetPlug]: {},
                [InventoryItemHashes.WrapsOfDetestationGauntletsPlug]: {},
                [InventoryItemHashes.RobesOfDetestationChestArmorPlug]: {},

                // titan
                [InventoryItemHashes.HelmOfAgonyHelmetPlug]: {},
                [InventoryItemHashes.GauntletsOfAgonyGauntletsPlug]: {},
                [InventoryItemHashes.PlateOfAgonyChestArmorPlug]: {},
            },
        },
        {
            phaseHash: 3920032267, // best guess
            traversal: true,
            displayProperties: {
                name: "Enter the Root",
                description: "Continue exploring the Pyramid.",
            },
        },
        {
            phaseHash: 1848647602, // best guess
            traversal: true,
            displayProperties: {
                name: "Enter the Root",
                description: "Reach the entrance of the root.",
            },
        },
        {
            phaseHash: 2224793617,
            displayProperties: {
                name: "Scission",
                directive: "Charge the Root",
                description: "Overcharge the root to fuel Nezarec's return.",
            },
            dropTable: {

                [InventoryItemHashes.MykelsReverenceSidearm_ItemType3]: {},
                [InventoryItemHashes.KoraxissDistressGrenadeLauncher_ItemType3]: {},
                [InventoryItemHashes.NessasOblationShotgun_ItemType3]: {},
                [InventoryItemHashes.AcasiasDejectionTraceRifle_ItemType3]: {},

                // hunter
                [InventoryItemHashes.GripsOfTrepidationGauntletsPlug]: {},
                [InventoryItemHashes.VestOfTrepidationChestArmorPlug]: {},
                [InventoryItemHashes.BootsOfTrepidationLegArmorPlug]: {},

                // warlock
                [InventoryItemHashes.WrapsOfDetestationGauntletsPlug]: {},
                [InventoryItemHashes.RobesOfDetestationChestArmorPlug]: {},
                [InventoryItemHashes.BootsOfDetestationLegArmorPlug]: {},

                // titan
                [InventoryItemHashes.GauntletsOfAgonyGauntletsPlug]: {},
                [InventoryItemHashes.PlateOfAgonyChestArmorPlug]: {},
                [InventoryItemHashes.GreavesOfAgonyLegArmorPlug]: {},
            },
        },
        {
            phaseHash: 2184227225, // best guess
            traversal: true,
            displayProperties: {
                name: "Cross the Chasm",
                description: "Make your way across the chasm.",
            },
        },
        {
            phaseHash: 2046062211,
            displayProperties: {
                name: "Macrocosm",
                directive: "Defeat the Explicator",
                description: "Confront the Explicator and disrupt his influence.",
            },
            dropTable: {

                [InventoryItemHashes.MykelsReverenceSidearm_ItemType3]: {},
                [InventoryItemHashes.KoraxissDistressGrenadeLauncher_ItemType3]: {},
                [InventoryItemHashes.RufussFuryAutoRifle_ItemType3]: {},
                [InventoryItemHashes.AcasiasDejectionTraceRifle_ItemType3]: {},

                // hunter
                [InventoryItemHashes.VestOfTrepidationChestArmorPlug]: {},
                [InventoryItemHashes.BootsOfTrepidationLegArmorPlug]: {},
                [InventoryItemHashes.CloakOfTrepidationHunterCloakPlug]: {},

                // warlock
                [InventoryItemHashes.RobesOfDetestationChestArmorPlug]: {},
                [InventoryItemHashes.BootsOfDetestationLegArmorPlug]: {},
                [InventoryItemHashes.BondOfDetestationWarlockBondPlug]: {},

                // titan
                [InventoryItemHashes.PlateOfAgonyChestArmorPlug]: {},
                [InventoryItemHashes.GreavesOfAgonyLegArmorPlug]: {},
                [InventoryItemHashes.MarkOfAgonyTitanMarkPlug]: {},

            },
        },
        {
            phaseHash: 3604501642, // best guess
            traversal: true,
            displayProperties: {
                name: "Charge the Root",
                description: "Overcharge the root to fuel Nezarec's return.",
            },
        },
        {
            phaseHash: 3008487717, // best guess
            traversal: true,
            displayProperties: {
                name: "Return to Nezarec",
                description: "Locate Nezarec at the place of his newfound power.",
            },
        },
        {
            phaseHash: 2779782231,
            displayProperties: {
                name: "Defeat Nezarec",
                description: "Lay Nezarec to his final rest.",
            },
            dropTable: {
                [InventoryItemHashes.ConditionalFinalityShotgun_EquippingBlockUniqueLabelExoticWeapon]: {},
                [InventoryItemHashes.BriarsContemptLinearFusionRifle_ItemType3]: {},
                [InventoryItemHashes.MykelsReverenceSidearm_ItemType3]: {},
                [InventoryItemHashes.KoraxissDistressGrenadeLauncher_ItemType3]: {},
                [InventoryItemHashes.RufussFuryAutoRifle_ItemType3]: {},
                [InventoryItemHashes.AcasiasDejectionTraceRifle_ItemType3]: {},
                [InventoryItemHashes.NessasOblationShotgun_ItemType3]: {},

                // hunter
                [InventoryItemHashes.MaskOfTrepidationHelmetPlug]: {},
                [InventoryItemHashes.BootsOfTrepidationLegArmorPlug]: {},
                [InventoryItemHashes.CloakOfTrepidationHunterCloakPlug]: {},

                // warlock
                [InventoryItemHashes.MaskOfDetestationHelmetPlug]: {},
                [InventoryItemHashes.BootsOfDetestationLegArmorPlug]: {},
                [InventoryItemHashes.BondOfDetestationWarlockBondPlug]: {},

                // titan
                [InventoryItemHashes.HelmOfAgonyHelmetPlug]: {},
                [InventoryItemHashes.GreavesOfAgonyLegArmorPlug]: {},
                [InventoryItemHashes.MarkOfAgonyTitanMarkPlug]: {},
            },
        },
    ],
    master: {
        activityHash: ActivityHashes.RootOfNightmaresMaster,
        dropTable: {
            [InventoryItemHashes.MykelsReverenceAdeptSidearm_ItemType3]: {},
            [InventoryItemHashes.AcasiasDejectionAdeptTraceRifle_ItemType3]: {},
            [InventoryItemHashes.RufussFuryAdeptAutoRifle_ItemType3]: {},
            [InventoryItemHashes.KoraxissDistressAdeptGrenadeLauncher_ItemType3]: {},
            [InventoryItemHashes.BriarsContemptAdeptLinearFusionRifle_ItemType3]: {},
            [InventoryItemHashes.NessasOblationAdeptShotgun_ItemType3]: {},
        },
    },
    rotations: {
        anchor: "2023-03-28T17:00:00Z",
        challenges: [
            ActivityModifierHashes.IlluminatedTormentChallenge,
            ActivityModifierHashes.CrossfireChallenge,
            ActivityModifierHashes.CosmicEquilibriumChallenge,
            ActivityModifierHashes.AllHandsChallenge,
        ],
    },
} satisfies DeepsightDropTableDefinition;

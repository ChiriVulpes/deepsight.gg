import { ActivityHashes, InventoryItemHashes, RecordHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
    hash: ActivityHashes.DeepStoneCrypt_RewardsLength0,
    displayProperties: {
        icon: { DestinyRecordDefinition: RecordHashes.DeepStoneCrypt3185876102 },
    },
    encounters: [
        {
            traversal: true,
            displayProperties: {
                name: "Locate the Deep Stone Crypt",
                description: "Survive the cold while locating the Deep Stone Crypt.",
            },
        },
        {
            phaseHash: 2776463390,
            displayProperties: {
                name: "Crypt Security",
                directive: "Disable Crypt Security",
                description: "Destroy the Crypt's power system to disable security.",
            },
            dropTable: {
                [InventoryItemHashes.TrusteeScoutRifle]: {},

                // hunter
                [InventoryItemHashes.LegacysOathGripsGauntletsPlug]: {},
                [InventoryItemHashes.LegacysOathStridesLegArmorPlug]: {},
                [InventoryItemHashes.LegacysOathCloakHunterCloakPlug]: {},

                // warlock
                [InventoryItemHashes.LegacysOathGlovesGauntletsPlug]: {},
                [InventoryItemHashes.LegacysOathBootsLegArmorPlug]: {},
                [InventoryItemHashes.LegacysOathBondWarlockBondPlug]: {},

                // titan
                [InventoryItemHashes.LegacysOathGauntletsGauntletsPlug]: {},
                [InventoryItemHashes.LegacysOathGreavesLegArmorPlug]: {},
                [InventoryItemHashes.LegacysOathMarkTitanMarkPlug]: {},
            },
        },
        {
            phaseHash: 3847348336,
            traversal: true,
            displayProperties: {
                name: "Locate Eramis's Followers",
                description: "Push deeper into the Crypt and locate Eramis's followers.",
            },
        },
        {
            phaseHash: 416127450,
            displayProperties: {
                name: "Atraks-1",
                directive: "Defeat Atraks-1",
                description: "Take down the Fallen Exo Atraks-1.",
            },
            dropTable: {
                [InventoryItemHashes.SuccessionSniperRifle2990047042]: {},
                [InventoryItemHashes.HeritageShotgun]: {},

                // hunter
                [InventoryItemHashes.LegacysOathGripsGauntletsPlug]: {},
                [InventoryItemHashes.LegacysOathStridesLegArmorPlug]: {},
                [InventoryItemHashes.LegacysOathCloakHunterCloakPlug]: {},

                // warlock
                [InventoryItemHashes.LegacysOathGlovesGauntletsPlug]: {},
                [InventoryItemHashes.LegacysOathBootsLegArmorPlug]: {},
                [InventoryItemHashes.LegacysOathBondWarlockBondPlug]: {},

                // titan
                [InventoryItemHashes.LegacysOathGauntletsGauntletsPlug]: {},
                [InventoryItemHashes.LegacysOathGreavesLegArmorPlug]: {},
                [InventoryItemHashes.LegacysOathMarkTitanMarkPlug]: {},
            },
        },
        {
            phaseHash: 1370965191,
            traversal: true,
            displayProperties: {
                name: "Locate the Nuclear Contingency Chamber",
                description: "Reach the nuclear contingency chamber.",
            },
        },
        {
            phaseHash: 1858926029,
            displayProperties: {
                name: "Descent",
                directive: "Prevent Europa's Destruction",
                description: "Disarm the Nuclear Descent Protocol.",
            },
            dropTable: {
                [InventoryItemHashes.PosterityHandCannon]: {},

                // hunter
                [InventoryItemHashes.LegacysOathGripsGauntletsPlug]: {},
                [InventoryItemHashes.LegacysOathVestChestArmorPlug]: {},
                [InventoryItemHashes.LegacysOathCloakHunterCloakPlug]: {},

                // warlock
                [InventoryItemHashes.LegacysOathGlovesGauntletsPlug]: {},
                [InventoryItemHashes.LegacysOathRobesChestArmorPlug]: {},
                [InventoryItemHashes.LegacysOathBondWarlockBondPlug]: {},

                // titan
                [InventoryItemHashes.LegacysOathGauntletsGauntletsPlug]: {},
                [InventoryItemHashes.LegacysOathPlateChestArmorPlug]: {},
                [InventoryItemHashes.LegacysOathMarkTitanMarkPlug]: {},
            },
        },
        {
            traversal: true,
            phaseHash: 1594577984,
            displayProperties: {
                name: "Emerge from the Wreckage",
                description: "Make your way out of the wreckage of the Morning Star.",
            },
        },
        {
            phaseHash: 4035296150,
            displayProperties: {
                name: "Taniks, the Abomination",
                directive: "Defeat Taniks, the Abomination",
                description: "Defeat Taniks for good.",
            },
            dropTable: {
                [InventoryItemHashes.BequestSword]: {},
                [InventoryItemHashes.CommemorationMachineGun]: {},
                [InventoryItemHashes.EyesOfTomorrowRocketLauncher]: {},

                // hunter
                [InventoryItemHashes.LegacysOathMaskHelmetPlug]: {},
                [InventoryItemHashes.LegacysOathVestChestArmorPlug]: {},
                [InventoryItemHashes.LegacysOathStridesLegArmorPlug]: {},

                // warlock
                [InventoryItemHashes.LegacysOathCowlHelmetPlug]: {},
                [InventoryItemHashes.LegacysOathRobesChestArmorPlug]: {},
                [InventoryItemHashes.LegacysOathBootsLegArmorPlug]: {},

                // titan
                [InventoryItemHashes.LegacysOathHelmHelmetPlug]: {},
                [InventoryItemHashes.LegacysOathPlateChestArmorPlug]: {},
                [InventoryItemHashes.LegacysOathGreavesLegArmorPlug]: {},
            },
        },
    ],
} satisfies DeepsightDropTableDefinition;

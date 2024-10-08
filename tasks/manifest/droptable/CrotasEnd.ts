import { ActivityHashes, InventoryItemHashes, RecordHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

export default {
    hash: ActivityHashes.CrotasEndNormal,
    displayProperties: {
        icon: { DestinyRecordDefinition: RecordHashes.CrotasEnd2045739672 },
    },
    encounters: [
        {
            traversal: true,
            displayProperties: {
                name: "Descend into the Hellmouth",
                description: "Find a safe path into the Hellmouth.",
            },
        },
        {

            phaseHash: 2890972472,
            displayProperties: {
                name: "The Abyss",
                directive: "Traverse the Abyss",
                description: "Uncover the illuminated path in the darkness.",
            },
            dropTable: {
                [InventoryItemHashes.SongOfIrYutMachineGun]: {},
                [InventoryItemHashes.FangOfIrYutScoutRifle]: {},
                [InventoryItemHashes.AbyssDefiantAutoRifle]: {},

                // hunter
                [InventoryItemHashes.UnyieldingCasqueHelmetPlug]: {},
                [InventoryItemHashes.DoggedGageGauntletsPlug]: {},
                [InventoryItemHashes.RelentlessHarnessChestArmorPlug]: {},

                // warlock
                [InventoryItemHashes.DeathsingersGazeHelmetPlug]: {},
                [InventoryItemHashes.DeathsingersGripGauntletsPlug]: {},
                [InventoryItemHashes.DeathsingersMantleChestArmorPlug]: {},

                // titan
                [InventoryItemHashes.WillbreakersWatchHelmetPlug]: {},
                [InventoryItemHashes.WillbreakersFistsGauntletsPlug]: {},
                [InventoryItemHashes.WillbreakersResolveChestArmorPlug]: {},

            },
        },
        {
            phaseHash: 3768812794,
            displayProperties: {
                name: "Oversoul Throne Bridge",
                directive: "Cross the Bridge",
                description: "Find a way across the chasm.",
            },
            dropTable: {
                [InventoryItemHashes.SwordbreakerShotgun]: {},
                [InventoryItemHashes.FangOfIrYutScoutRifle]: {},
                [InventoryItemHashes.OversoulEdictPulseRifle]: {},

                // hunter
                [InventoryItemHashes.DoggedGageGauntletsPlug]: {},
                [InventoryItemHashes.RelentlessHarnessChestArmorPlug]: {},
                [InventoryItemHashes.TirelessStridersLegArmorPlug]: {},

                // warlock
                [InventoryItemHashes.DeathsingersGripGauntletsPlug]: {},
                [InventoryItemHashes.DeathsingersMantleChestArmorPlug]: {},
                [InventoryItemHashes.DeathsingersHeraldLegArmorPlug]: {},

                // titan
                [InventoryItemHashes.WillbreakersFistsGauntletsPlug]: {},
                [InventoryItemHashes.WillbreakersResolveChestArmorPlug]: {},
                [InventoryItemHashes.WillbreakersGreavesLegArmorPlug]: {},
            },
        },
        {
            phaseHash: 3580589436,
            traversal: true,
            displayProperties: {
                name: "Enter Crota's Chamber",
                description: "Breach the Hive barrier to access Crota's Chamber.",
            },
        },
        {
            phaseHash: 1463700798,
            displayProperties: {
                name: "Ir Yût, the Deathsinger",
                directive: "Reach the Summoning Crystal",
                description: "Defeat the Hive Wizard guarding the summoning crystal.",
            },
            dropTable: {
                [InventoryItemHashes.WordOfCrotaHandCannon]: {},
                [InventoryItemHashes.SongOfIrYutMachineGun]: {},
                [InventoryItemHashes.OversoulEdictPulseRifle]: {},

                // hunter
                [InventoryItemHashes.RelentlessHarnessChestArmorPlug]: {},
                [InventoryItemHashes.TirelessStridersLegArmorPlug]: {},
                [InventoryItemHashes.ShroudOfFliesHunterCloakPlug]: {},

                // warlock
                [InventoryItemHashes.DeathsingersMantleChestArmorPlug]: {},
                [InventoryItemHashes.DeathsingersHeraldLegArmorPlug]: {},
                [InventoryItemHashes.BoneCircletWarlockBondPlug]: {},

                // titan
                [InventoryItemHashes.WillbreakersResolveChestArmorPlug]: {},
                [InventoryItemHashes.WillbreakersGreavesLegArmorPlug]: {},
                [InventoryItemHashes.MarkOfThePitTitanMarkPlug]: {},
            },
        },
        {
            phaseHash: 4240994016,
            displayProperties: {
                name: "Crota, Son of Oryx",
                directive: "Defeat Crota",
                description: "Use Crota's most powerful weapon against him.",
            },
            dropTable: {
                [InventoryItemHashes.NecrochasmAutoRifle]: { requiresQuest: InventoryItemHashes.BottomlessPitQuestStep_Step2 },
                [InventoryItemHashes.WordOfCrotaHandCannon]: {},
                [InventoryItemHashes.AbyssDefiantAutoRifle]: {},
                [InventoryItemHashes.SwordbreakerShotgun]: {},

                // hunter
                [InventoryItemHashes.UnyieldingCasqueHelmetPlug]: {},
                [InventoryItemHashes.TirelessStridersLegArmorPlug]: {},
                [InventoryItemHashes.ShroudOfFliesHunterCloakPlug]: {},

                // warlock
                [InventoryItemHashes.DeathsingersGazeHelmetPlug]: {},
                [InventoryItemHashes.DeathsingersHeraldLegArmorPlug]: {},
                [InventoryItemHashes.BoneCircletWarlockBondPlug]: {},

                // titan
                [InventoryItemHashes.WillbreakersWatchHelmetPlug]: {},
                [InventoryItemHashes.WillbreakersGreavesLegArmorPlug]: {},
                [InventoryItemHashes.MarkOfThePitTitanMarkPlug]: {},
            },
        },
    ],
    master: {
        activityHash: ActivityHashes.CrotasEndMaster,
        dropTable: {
            [InventoryItemHashes.SongOfIrYutAdeptMachineGun]: {},
            [InventoryItemHashes.OversoulEdictAdeptPulseRifle]: {},
            [InventoryItemHashes.WordOfCrotaAdeptHandCannon]: {},
            [InventoryItemHashes.AbyssDefiantAdeptAutoRifle]: {},
            [InventoryItemHashes.FangOfIrYutAdeptScoutRifle]: {},
            [InventoryItemHashes.SwordbreakerAdeptShotgun]: {},
        },
    },
    // bungie broke the crota's end challenges
    // rotations: {
    //     anchor: "2023-10-17T17:00:00Z",
    //     challenges: [
    //         ActivityModifierHashes.ConservationOfEnergy,
    //         ActivityModifierHashes.PrecariousBalance,
    //         ActivityModifierHashes.EqualVessels,
    //         ActivityModifierHashes.AllForOne,
    //     ],
    // },
} satisfies DeepsightDropTableDefinition;

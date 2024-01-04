import { ActivityHashes, ActivityModifierHashes, InventoryItemHashes, RecordHashes } from "../Enums";

export default {
    hash: ActivityHashes.CrotasEnd,
    displayProperties: {
        icon: { DestinyRecordDefinition: RecordHashes.CrotasEnd2045739672 }
    },
    encounters: [
        {
            traversal: true,
            displayProperties: {
                name: "Descend into the Hellmouth",
                description: "Find a safe path into the Hellmouth.",
            }
        },
        {

            phaseHash: 2890972472,
            displayProperties: {
                name: "The Abyss",
                directive: "Traverse the Abyss",
                description: "Uncover the illuminated path in the darkness.",
            },
            dropTable: {
                [InventoryItemHashes.SongOfIrYutMachineGun_ItemType3]: {},
                [InventoryItemHashes.FangOfIrYutScoutRifle_ItemType3]: {},
                [InventoryItemHashes.AbyssDefiantAutoRifle_ItemType3]: {},

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
                [InventoryItemHashes.SwordbreakerShotgun_ItemType3]: {},
                [InventoryItemHashes.FangOfIrYutScoutRifle_ItemType3]: {},
                [InventoryItemHashes.OversoulEdictPulseRifle_ItemType3]: {},

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
            }
        },
        {
            phaseHash: 1463700798,
            displayProperties: {
                name: "Ir Yût, the Deathsinger",
                description: "Defeat Ir Yût, the Deathsinger",
            },
            dropTable: {
                [InventoryItemHashes.WordOfCrotaHandCannon_ItemType3]: {},
                [InventoryItemHashes.SongOfIrYutMachineGun_ItemType3]: {},
                [InventoryItemHashes.OversoulEdictPulseRifle_ItemType3]: {},

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
                description: "Defeat Crota, Son of Oryx",
            },
            dropTable: {
                [InventoryItemHashes.NecrochasmAutoRifle]: { requiresQuest: InventoryItemHashes.BottomlessPitQuestStep_Step2 }, // Necrochasm
                [InventoryItemHashes.WordOfCrotaHandCannon_ItemType3]: {},
                [InventoryItemHashes.AbyssDefiantAutoRifle_ItemType3]: {},
                [InventoryItemHashes.SwordbreakerShotgun_ItemType3]: {},

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
            [InventoryItemHashes.SongOfIrYutAdeptMachineGun_ItemType3]: {},
            [InventoryItemHashes.OversoulEdictAdeptPulseRifle_ItemType3]: {},
            [InventoryItemHashes.WordOfCrotaAdeptHandCannon_ItemType3]: {},
            [InventoryItemHashes.AbyssDefiantAdeptAutoRifle_ItemType3]: {},
            [InventoryItemHashes.FangOfIrYutAdeptScoutRifle_ItemType3]: {},
            [InventoryItemHashes.SwordbreakerAdeptShotgun_ItemType3]: {},
        },
    },
    rotations: {
        anchor: "2023-10-17T17:00:00", // oct 18
        challenges: [
            [ActivityModifierHashes.ConservationOfEnergy],
            [ActivityModifierHashes.PrecariousBalance],
            [ActivityModifierHashes.EqualVessels],
            [ActivityModifierHashes.AllForOne],
        ],
    },
}

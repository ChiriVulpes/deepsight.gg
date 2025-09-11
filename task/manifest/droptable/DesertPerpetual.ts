import { ActivityHashes, InventoryItemHashes, RecordHashes } from '@deepsight.gg/Enums'
import type { DeepsightDropTableDefinition } from './DeepsightDropTableDefinition'

// https://docs.google.com/spreadsheets/d/1m-Jxdv5uR_k8AchqQ6wekRedEKB--A_rf7eQZMyDO6k/edit
export default {
	hash: ActivityHashes.TheDesertPerpetualStandard,
	displayProperties: {
		icon: { DestinyRecordDefinition: RecordHashes.TheDesertPerpetualLoreBookUnlocks },
	},
	encounters: [
		// The Nursery
		{
			traversal: true,
			displayProperties: {
				name: 'Reconnoiter',
				description: 'Your feet find purchase in shifting sands.',
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: 'Predestination',
				description: 'Choose your lot in life.',
			},
		},

		// Axion is axiom
		// The Chambers
		{
			traversal: true,
			displayProperties: {
				name: 'Deeper, Deeper',
				description: 'Descend into the core of the world.',
			},
		},
		{
			displayProperties: {
				name: 'Living Rhythm',
				directive: 'Iatros, Inward-Turned',
				description: 'Defeat Iatros, Inward-Turned.',
			},
			dropTable: {
				[InventoryItemHashes.IntercalaryAutoRifle]: {},
				[InventoryItemHashes.TheWhenAndWhereRocketLauncher]: {},
				[InventoryItemHashes.FiniteMaybeFusionRifle]: {},

				// hunter
				[InventoryItemHashes.CollectivePsycheCasqueHelmetPlug]: {},
				[InventoryItemHashes.CollectivePsycheCuirassChestArmorPlug]: {},
				[InventoryItemHashes.CollectivePsycheSleevesGauntletsPlug]: {},
				[InventoryItemHashes.CollectivePsycheCloakHunterCloakPlug]: {},
				// warlock
				[InventoryItemHashes.CollectivePsycheCoverHelmetPlug]: {},
				[InventoryItemHashes.CollectivePsycheRobesChestArmorPlug]: {},
				[InventoryItemHashes.CollectivePsycheGlovesGauntletsPlug]: {},
				[InventoryItemHashes.CollectivePsycheBondWarlockBondPlug]: {},
				// titan
				[InventoryItemHashes.CollectivePsycheHelmHelmetPlug]: {},
				[InventoryItemHashes.CollectivePsychePlateChestArmorPlug]: {},
				[InventoryItemHashes.CollectivePsycheGauntletsGauntletsPlug]: {},
				[InventoryItemHashes.CollectivePsycheMarkTitanMarkPlug]: {},
			},
		},

		// All are entangled
		// Fallow Pavilion
		{
			traversal: true,
			displayProperties: {
				name: 'Outwards',
				description: 'Make your way towards a study hall abandoned in haste.',
			},
		},
		{
			displayProperties: {
				name: 'Clear Sight',
				directive: 'Epoptes, Lord of Quanta',
				description: 'Defeat Epoptes, Lord of Quanta.',
			},
			dropTable: {
				[InventoryItemHashes.OpaqueHourglassCombatBow]: {},
				[InventoryItemHashes.TheWhenAndWhereRocketLauncher]: {},
				[InventoryItemHashes.LanceEphemeralSniperRifle]: {},

				// hunter
				[InventoryItemHashes.CollectivePsycheSleevesGauntletsPlug]: {},
				[InventoryItemHashes.CollectivePsycheStridesLegArmorPlug]: {},
				[InventoryItemHashes.CollectivePsycheCloakHunterCloakPlug]: {},
				// warlock
				[InventoryItemHashes.CollectivePsycheGlovesGauntletsPlug]: {},
				[InventoryItemHashes.CollectivePsycheBootsLegArmorPlug]: {},
				[InventoryItemHashes.CollectivePsycheBondWarlockBondPlug]: {},
				// titan
				[InventoryItemHashes.CollectivePsycheGauntletsGauntletsPlug]: {},
				[InventoryItemHashes.CollectivePsycheGreavesLegArmorPlug]: {},
				[InventoryItemHashes.CollectivePsycheMarkTitanMarkPlug]: {},
			},
		},

		// Interference patterns swell
		// Velocity's Tomb
		{
			traversal: true,
			displayProperties: {
				name: 'Past\'s Wreckage',
				description: 'The Vex labor in the wreckage of the Aionians\' first home. Find them.',
			},
		},
		{
			displayProperties: {
				name: 'Inverse Function',
				directive: 'Agraios, Inherent',
				description: 'Defeat Agraios, Inherent.',
			},
			dropTable: {
				[InventoryItemHashes.LanceEphemeralSniperRifle]: {},
				[InventoryItemHashes.AntedateSubmachineGun]: {},
				[InventoryItemHashes.IntercalaryAutoRifle]: {},

				// hunter
				[InventoryItemHashes.CollectivePsycheCasqueHelmetPlug]: {},
				[InventoryItemHashes.CollectivePsycheSleevesGauntletsPlug]: {},
				[InventoryItemHashes.CollectivePsycheStridesLegArmorPlug]: {},
				// warlock
				[InventoryItemHashes.CollectivePsycheCoverHelmetPlug]: {},
				[InventoryItemHashes.CollectivePsycheGlovesGauntletsPlug]: {},
				[InventoryItemHashes.CollectivePsycheBootsLegArmorPlug]: {},
				// titan
				[InventoryItemHashes.CollectivePsycheHelmHelmetPlug]: {},
				[InventoryItemHashes.CollectivePsycheGauntletsGauntletsPlug]: {},
				[InventoryItemHashes.CollectivePsycheGreavesLegArmorPlug]: {},
			},
		},

		{
			traversal: true,
			displayProperties: {
				name: 'Uncertain Future',
				description: '',
			},
		},
		{
			traversal: true,
			displayProperties: {
				name: 'Wayfinding',
				description: '',
			},
		},
		{
			displayProperties: {
				name: 'The End Times',
				directive: 'Koregos, the Worldline',
				description: 'Defeat Koregos, the Worldline',
			},
			dropTable: {
				[InventoryItemHashes.WhirlingOvationRocketLauncher]: {},
				[InventoryItemHashes.FiniteMaybeFusionRifle]: {},
				[InventoryItemHashes.OpaqueHourglassCombatBow]: {},
				[InventoryItemHashes.AntedateSubmachineGun]: {},

				// hunter
				[InventoryItemHashes.CollectivePsycheCasqueHelmetPlug]: {},
				[InventoryItemHashes.CollectivePsycheSleevesGauntletsPlug]: {},
				[InventoryItemHashes.CollectivePsycheStridesLegArmorPlug]: {},
				// warlock
				[InventoryItemHashes.CollectivePsycheCoverHelmetPlug]: {},
				[InventoryItemHashes.CollectivePsycheGlovesGauntletsPlug]: {},
				[InventoryItemHashes.CollectivePsycheBootsLegArmorPlug]: {},
				// titan
				[InventoryItemHashes.CollectivePsycheHelmHelmetPlug]: {},
				[InventoryItemHashes.CollectivePsycheGauntletsGauntletsPlug]: {},
				[InventoryItemHashes.CollectivePsycheGreavesLegArmorPlug]: {},
			},
		},
	],
} satisfies DeepsightDropTableDefinition

import type { ActivityGraphHashes } from '@deepsight.gg/Enums'
import { ActivityHashes, ActivityModeHashes, DestinationHashes, VendorHashes } from '@deepsight.gg/Enums'
import type { DeepsightItemSourceDefinition } from '@deepsight.gg/Interfaces'
import { DeepsightItemSourceType, type DeepsightItemSourceListDefinition } from '@deepsight.gg/Interfaces'
import type { DestinyActivityDefinition, DestinyDisplayCategoryDefinition } from 'bungie-api-ts/destiny2/interfaces'
import fs from 'fs-extra'
import { Task } from 'task'
import { getDeepsightCollectionsDefinition } from './DeepsightCollectionsDefinition'
import DestinyManifestReference from './DestinyManifestReference'
import manifest from './utility/endpoint/DestinyManifest'

type VendorCategoryTuple = readonly [DestinyDisplayCategoryDefinition, number[]]

async function getVendorCategories (vendorHash: number) {
	const { DestinyVendorDefinition } = manifest
	const vendor = await DestinyVendorDefinition.get(vendorHash)
	return !vendor ? [] : vendor?.displayCategories
		.map((category, i) => [
			category,
			vendor.itemList.filter(item => item.displayCategoryIndex === i).map(item => item.itemHash),
		] as const)
}

async function getVendorCategoryItems (categories: VendorCategoryTuple[]) {
	return await Promise.all(categories.map(([category, items]) => getCollectionsItems(items)))
		.then(items => items.flat())
}

async function getDropsFromActivityGraphs (...graphs: ActivityGraphHashes[]) {
	return getActivities(...graphs)
		.then(activities => Promise.all(activities.map(getDropsFromActivity)))
		.then(items => Array.from(new Set(items.flat())))
}

async function getActivities (...graphs: ActivityGraphHashes[]) {
	const result: DestinyActivityDefinition[] = []
	for (const graph of graphs) {
		const { DestinyActivityGraphDefinition, DestinyActivityDefinition } = manifest
		const activityGraph = await DestinyActivityGraphDefinition.get(graph)
		if (!activityGraph)
			continue

		result.push(...await Promise.all(activityGraph.nodes.flatMap(node => node.activities.map(activity => DestinyActivityDefinition.get(activity.activityHash))))
			.then(activities => activities.filter(activity => activity !== undefined))
		)
	}
	return result
}

async function getDropsFromActivity (activity: DestinyActivityDefinition) {
	return await Promise.all(activity.rewards.flatMap(reward => reward.rewardItems.map(item => getCollectionsItem(item.itemHash))))
		.then(items => items.filter(item => item !== undefined))
}

async function getCollectionsItems (itemHashes: number[]) {
	return Promise.all(itemHashes.map(itemHash => getCollectionsItem(itemHash)))
		.then(items => items.filter(item => item !== undefined))
}

async function getCollectionsItem (itemHash: number) {
	if ((await getCollectionsItemList()).includes(itemHash))
		return itemHash

	const { DestinyInventoryItemDefinition } = manifest
	const collections = await getCollectionsItemMap()
	const item = await DestinyInventoryItemDefinition.get(itemHash)
	if (!item?.displayProperties.name || !item.iconWatermark)
		return undefined

	return collections[`${item.displayProperties.name}/${item.iconWatermark}`]
}

let _itemMap: Promise<Record<string, number>> | Record<string, number> | undefined
let _itemList: Promise<number[]> | number[] | undefined
async function getCollectionsItemList () {
	if (_itemList)
		return _itemList

	return _itemList = (async () => {
		return Object.values(await getCollectionsItemMap())
	})()
}
async function getCollectionsItemMap () {
	if (_itemMap)
		return _itemMap

	return _itemMap = (async () => {
		const itemMap: Record<string, number> = {}

		const { DestinyInventoryItemDefinition } = manifest
		const collections = await getDeepsightCollectionsDefinition()
		for (const moment of Object.values(collections)) {
			for (const item of Object.values(moment.buckets).flat()) {
				const itemDefinition = await DestinyInventoryItemDefinition.get(item)
				if (itemDefinition?.displayProperties.name && itemDefinition.iconWatermark)
					itemMap[`${itemDefinition.displayProperties.name}/${itemDefinition.iconWatermark}`] = item
			}
		}

		return _itemMap = itemMap
	})()
}

const ACTIVITY_GRAPH_HASH_SOLO_OPS = 1733518967 as ActivityGraphHashes
const ACTIVITY_GRAPH_HASH_FIRETEAM_OPS = 2021988413 as ActivityGraphHashes
const ACTIVITY_GRAPH_HASH_PINNACLE_OPS = 2427019152 as ActivityGraphHashes
const ACTIVITY_GRAPH_HASH_CRUCIBLE_OPS = 3557894678 as ActivityGraphHashes

export default Task('DeepsightItemSourceDefinition', async task => {
	const itemSources: Record<DeepsightItemSourceType, number[]> = {
		[DeepsightItemSourceType.CommanderZavalaLegacyGear]: await getVendorCategories(VendorHashes.LegacyGear3444362755)
			.then(categories => categories.filter(([category]) => category.identifier !== 'category_legacy_nightfall'))
			.then(getVendorCategoryItems),
		[DeepsightItemSourceType.LordShaxxLegacyGear]: await getVendorCategories(VendorHashes.LegacyGear2595490586).then(getVendorCategoryItems),
		[DeepsightItemSourceType.DrifterLegacyGear]: await getVendorCategories(VendorHashes.LegacyGear2906014866).then(getVendorCategoryItems),
		[DeepsightItemSourceType.Saint14LegacyGear]: await getVendorCategories(VendorHashes.LegacyGear4140351452).then(getVendorCategoryItems),
		// [DeepsightItemSourceType.SaladinLegacyGear]: await getCategories(VendorHashes.LegacyGear2672927612).then(getItems),
		[DeepsightItemSourceType.ExoticKioskLegacyGear]: await getVendorCategories(VendorHashes.LegacyGear1092954315).then(getVendorCategoryItems),
		[DeepsightItemSourceType.BansheeFocusedDecoding]: await getVendorCategories(VendorHashes.FocusedDecoding2435958557).then(getVendorCategoryItems),
		[DeepsightItemSourceType.BansheeFeatured]: await getVendorCategories(VendorHashes.Banshee44_Enabledtrue)
			.then(categories => categories.filter(([category]) => category.identifier === 'category_weapon_meta'))
			.then(getVendorCategoryItems),
		// [DeepsightItemSourceType.XurFeatured]: [],
		[DeepsightItemSourceType.VanguardOps]: await getDropsFromActivityGraphs(ACTIVITY_GRAPH_HASH_SOLO_OPS, ACTIVITY_GRAPH_HASH_FIRETEAM_OPS),
		[DeepsightItemSourceType.PinnacleOps]: await getDropsFromActivityGraphs(ACTIVITY_GRAPH_HASH_PINNACLE_OPS),
		[DeepsightItemSourceType.CrucibleOps]: await getDropsFromActivityGraphs(ACTIVITY_GRAPH_HASH_CRUCIBLE_OPS),
	}

	const items = new Set(Object.values(itemSources).flat())

	const DeepsightItemSourceListDefinition: Record<number, DeepsightItemSourceListDefinition> = {}

	for (const itemHash of items) {
		DeepsightItemSourceListDefinition[itemHash] = {
			hash: itemHash,
			sources: (Object.entries(itemSources)
				.filter(([, items]) => items.includes(itemHash))
				.map(([type]) => +type as DeepsightItemSourceType)
			),
		}
	}

	const DeepsightItemSourceDefinition: Record<DeepsightItemSourceType, DeepsightItemSourceDefinition> = {
		[DeepsightItemSourceType.CommanderZavalaLegacyGear]: {
			hash: DeepsightItemSourceType.CommanderZavalaLegacyGear,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.CommanderZavala_Enabledtrue },
				subtitle: { DestinyVendorDefinition: VendorHashes.LegacyGear3444362755 },
				description: { DestinyVendorDefinition: VendorHashes.CommanderZavala_Enabledtrue },
			}),
		},
		[DeepsightItemSourceType.LordShaxxLegacyGear]: {
			hash: DeepsightItemSourceType.LordShaxxLegacyGear,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.LordShaxx_Enabledtrue },
				subtitle: { DestinyVendorDefinition: VendorHashes.LegacyGear2595490586 },
				description: { DestinyVendorDefinition: VendorHashes.LordShaxx_Enabledtrue },
			}),
		},
		[DeepsightItemSourceType.DrifterLegacyGear]: {
			hash: DeepsightItemSourceType.DrifterLegacyGear,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.TheDrifter_Enabledtrue },
				subtitle: { DestinyVendorDefinition: VendorHashes.LegacyGear2906014866 },
				description: { DestinyVendorDefinition: VendorHashes.TheDrifter_Enabledtrue },
			}),
		},
		[DeepsightItemSourceType.Saint14LegacyGear]: {
			hash: DeepsightItemSourceType.Saint14LegacyGear,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.Saint14 },
				subtitle: { DestinyVendorDefinition: VendorHashes.LegacyGear4140351452 },
				description: { DestinyVendorDefinition: VendorHashes.Saint14 },
			}),
		},
		// [DeepsightItemSourceType.SaladinLegacyGear]: {
		// 	hash: DeepsightItemSourceType.SaladinLegacyGear,
		// 	displayProperties: await DestinyManifestReference.resolveAll({
		// 		name: { DestinyVendorDefinition: VendorHashes.Saladin_Enabledtrue },
		// 		subtitle: { DestinyVendorDefinition: VendorHashes.LegacyGear2672927612 },
		// 		description: { DestinyVendorDefinition: VendorHashes.Saladin_Enabledtrue },
		// 	}),
		// },
		[DeepsightItemSourceType.ExoticKioskLegacyGear]: {
			hash: DeepsightItemSourceType.ExoticKioskLegacyGear,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.MonumentToLostLights },
				subtitle: { DestinyVendorDefinition: VendorHashes.MonumentToLostLights },
				description: { DestinyVendorDefinition: VendorHashes.MonumentToLostLights },
			}),
		},
		[DeepsightItemSourceType.BansheeFocusedDecoding]: {
			hash: DeepsightItemSourceType.BansheeFocusedDecoding,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.Banshee44_Enabledtrue },
				subtitle: { DestinyVendorDefinition: VendorHashes.FocusedDecoding2435958557 },
				description: { DestinyVendorDefinition: VendorHashes.Banshee44_Enabledtrue },
			}),
		},
		[DeepsightItemSourceType.BansheeFeatured]: {
			hash: DeepsightItemSourceType.BansheeFeatured,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.Banshee44_Enabledtrue },
				subtitle: { DestinyVendorDefinition: VendorHashes.Banshee44_Enabledtrue },
				description: { DestinyVendorDefinition: VendorHashes.Banshee44_Enabledtrue },
			}),
		},
		// [DeepsightItemSourceType.XurFeatured]: {
		// 	hash: DeepsightItemSourceType.XurFeatured,
		// 	displayProperties: await DestinyManifestReference.resolveAll({
		// 		name: { DestinyVendorDefinition: VendorHashes.Xur_CategoriesLength13 },
		// 		description: { DestinyVendorDefinition: VendorHashes.Xur_CategoriesLength13 },
		// 	}),
		// },
		[DeepsightItemSourceType.VanguardOps]: {
			hash: DeepsightItemSourceType.VanguardOps,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyActivityDefinition: ActivityHashes.VanguardOps },
				description: { DestinyActivityDefinition: ActivityHashes.VanguardOps },
				icon: { DestinyActivityDefinition: ActivityHashes.VanguardOps },
			}),
		},
		[DeepsightItemSourceType.PinnacleOps]: {
			hash: DeepsightItemSourceType.PinnacleOps,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyActivityDefinition: ActivityHashes.PinnacleOps },
				description: { DestinyActivityDefinition: ActivityHashes.PinnacleOps },
				icon: { DestinyActivityDefinition: ActivityHashes.StarcrossedCustomize },
			}),
		},
		[DeepsightItemSourceType.CrucibleOps]: {
			hash: DeepsightItemSourceType.CrucibleOps,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyDestinationDefinition: DestinationHashes.TheCrucible4088006058 },
				description: { DestinyDestinationDefinition: DestinationHashes.TheCrucible4088006058 },
				icon: { DestinyActivityModeDefinition: ActivityModeHashes.Crucible },
			}),
		},
	}

	await fs.mkdir('docs/manifest', { recursive: true })
	await fs.writeJson('docs/manifest/DeepsightItemSourceListDefinition.json', DeepsightItemSourceListDefinition, { spaces: '\t' })
	await fs.writeJson('docs/manifest/DeepsightItemSourceDefinition.json', DeepsightItemSourceDefinition, { spaces: '\t' })
})

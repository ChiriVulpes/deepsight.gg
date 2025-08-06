import type { ActivityGraphHashes } from '@deepsight.gg/Enums'
import { ActivityHashes, ActivityModeHashes, EventCardHashes, FireteamFinderActivityGraphHashes, PresentationNodeHashes, VendorHashes } from '@deepsight.gg/Enums'
import type { DeepsightItemSourceDefinition } from '@deepsight.gg/Interfaces'
import { DeepsightItemSourceCategory, DeepsightItemSourceType, type DeepsightItemSourceListDefinition } from '@deepsight.gg/Interfaces'
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
		[DeepsightItemSourceType.CommanderZavalaLegacyGear]: await getVendorCategories(VendorHashes.VanguardEngramFocusingLegacy)
			.then(categories => categories.filter(([category]) => category.identifier !== 'category_legacy_nightfall'))
			.then(getVendorCategoryItems),
		[DeepsightItemSourceType.LordShaxxLegacyGear]: await getVendorCategories(VendorHashes.CrucibleEngramFocusingLegacy).then(getVendorCategoryItems),
		[DeepsightItemSourceType.DrifterLegacyGear]: await getVendorCategories(VendorHashes.GambitEngramFocusingLegacy).then(getVendorCategoryItems),
		[DeepsightItemSourceType.Saint14LegacyGear]: await getVendorCategories(VendorHashes.TrialsEngramFocusingLegacy).then(getVendorCategoryItems),
		// [DeepsightItemSourceType.SaladinLegacyGear]: await getCategories(VendorHashes.LegacyGear2672927612).then(getItems),
		[DeepsightItemSourceType.ExoticKioskLegacyGear]: await getVendorCategories(VendorHashes.TowerExoticArchivePinnacle).then(getVendorCategoryItems),
		[DeepsightItemSourceType.BansheeFocusedDecoding]: await getVendorCategories(VendorHashes.GunsmithFocusedDecoding).then(getVendorCategoryItems),
		[DeepsightItemSourceType.BansheeFeatured]: await getVendorCategories(VendorHashes.Gunsmith)
			.then(categories => categories.filter(([category]) => category.identifier === 'category_weapon_meta'))
			.then(getVendorCategoryItems),
		// [DeepsightItemSourceType.XurFeatured]: [],
		[DeepsightItemSourceType.VanguardOps]: await getDropsFromActivityGraphs(ACTIVITY_GRAPH_HASH_SOLO_OPS, ACTIVITY_GRAPH_HASH_FIRETEAM_OPS),
		[DeepsightItemSourceType.PinnacleOps]: await getDropsFromActivityGraphs(ACTIVITY_GRAPH_HASH_PINNACLE_OPS),
		[DeepsightItemSourceType.CrucibleOps]: await getDropsFromActivityGraphs(ACTIVITY_GRAPH_HASH_CRUCIBLE_OPS),
		[DeepsightItemSourceType.TrialsOfOsiris]: await getVendorCategories(VendorHashes.TrialsOfOsirisGear110620395).then(getVendorCategoryItems),
		[DeepsightItemSourceType.ArmsWeekEvent]: await getVendorCategories(VendorHashes.TowerShootingRangeAdaFocusing).then(getVendorCategoryItems),
		[DeepsightItemSourceType.SolsticeEvent]: await getVendorCategories(VendorHashes.DistortedSolsticeEngram2110607183).then(getVendorCategoryItems),
		[DeepsightItemSourceType.Kepler]: await getVendorCategories(VendorHashes.FocusedDecoding3550596112).then(getVendorCategoryItems),
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
			category: DeepsightItemSourceCategory.Vendor,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.TitanVanguard },
				subtitle: { DestinyVendorDefinition: VendorHashes.VanguardEngramFocusingLegacy },
				description: { DestinyVendorDefinition: VendorHashes.TitanVanguard },
				icon: { DestinyVendorDefinition: { hash: VendorHashes.TitanVanguard, property: 'mapIcon' } },
			}),
		},
		[DeepsightItemSourceType.LordShaxxLegacyGear]: {
			hash: DeepsightItemSourceType.LordShaxxLegacyGear,
			category: DeepsightItemSourceCategory.Vendor,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.Crucible },
				subtitle: { DestinyVendorDefinition: VendorHashes.CrucibleEngramFocusingLegacy },
				description: { DestinyVendorDefinition: VendorHashes.Crucible },
				icon: { DestinyVendorDefinition: { hash: VendorHashes.Crucible, property: 'mapIcon' } },
			}),
		},
		[DeepsightItemSourceType.DrifterLegacyGear]: {
			hash: DeepsightItemSourceType.DrifterLegacyGear,
			category: DeepsightItemSourceCategory.Vendor,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.Gambit },
				subtitle: { DestinyVendorDefinition: VendorHashes.GambitEngramFocusingLegacy },
				description: { DestinyVendorDefinition: VendorHashes.Gambit },
				icon: { DestinyVendorDefinition: { hash: VendorHashes.Gambit, property: 'mapIcon' } },
			}),
		},
		[DeepsightItemSourceType.Saint14LegacyGear]: {
			hash: DeepsightItemSourceType.Saint14LegacyGear,
			category: DeepsightItemSourceCategory.Vendor,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.TowerSaint14 },
				subtitle: { DestinyVendorDefinition: VendorHashes.TrialsEngramFocusingLegacy },
				description: { DestinyVendorDefinition: VendorHashes.TowerSaint14 },
				icon: { DestinyVendorDefinition: { hash: VendorHashes.TowerSaint14, property: 'mapIcon' } },
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
			category: DeepsightItemSourceCategory.Vendor,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.TowerExoticArchive },
				subtitle: { DestinyVendorDefinition: VendorHashes.TowerExoticArchive },
				description: { DestinyVendorDefinition: VendorHashes.TowerExoticArchive },
				icon: { DestinyVendorDefinition: { hash: VendorHashes.TowerExoticArchive, property: 'mapIcon' } },
			}),
		},
		[DeepsightItemSourceType.BansheeFocusedDecoding]: {
			hash: DeepsightItemSourceType.BansheeFocusedDecoding,
			category: DeepsightItemSourceCategory.Vendor,
			rotates: true,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.Gunsmith },
				subtitle: { DestinyVendorDefinition: VendorHashes.GunsmithFocusedDecoding },
				description: { DestinyVendorDefinition: VendorHashes.Gunsmith },
				icon: { DestinyVendorDefinition: { hash: VendorHashes.Gunsmith, property: 'mapIcon' } },
			}),
		},
		[DeepsightItemSourceType.BansheeFeatured]: {
			hash: DeepsightItemSourceType.BansheeFeatured,
			category: DeepsightItemSourceCategory.Vendor,
			rotates: true,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyVendorDefinition: VendorHashes.Gunsmith },
				subtitle: { DestinyVendorDefinition: VendorHashes.Gunsmith },
				description: { DestinyVendorDefinition: VendorHashes.Gunsmith },
				icon: { DestinyVendorDefinition: { hash: VendorHashes.Gunsmith, property: 'mapIcon' } },
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
			category: DeepsightItemSourceCategory.ActivityReward,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyActivityDefinition: ActivityHashes.VanguardOps },
				description: { DestinyActivityDefinition: ActivityHashes.VanguardOps },
				icon: { DestinyActivityDefinition: ActivityHashes.VanguardOps },
			}),
		},
		[DeepsightItemSourceType.PinnacleOps]: {
			hash: DeepsightItemSourceType.PinnacleOps,
			category: DeepsightItemSourceCategory.ActivityReward,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyActivityDefinition: ActivityHashes.PinnacleOps },
				description: { DestinyActivityDefinition: ActivityHashes.PinnacleOps },
				icon: { DestinyActivityDefinition: ActivityHashes.StarcrossedCustomize },
			}),
		},
		[DeepsightItemSourceType.CrucibleOps]: {
			hash: DeepsightItemSourceType.CrucibleOps,
			category: DeepsightItemSourceCategory.ActivityReward,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyFireteamFinderActivityGraphDefinition: FireteamFinderActivityGraphHashes.CrucibleOps },
				description: { DestinyFireteamFinderActivityGraphDefinition: FireteamFinderActivityGraphHashes.CrucibleOps },
				icon: { DestinyActivityModeDefinition: ActivityModeHashes.Crucible },
			}),
		},
		[DeepsightItemSourceType.TrialsOfOsiris]: {
			hash: DeepsightItemSourceType.TrialsOfOsiris,
			category: DeepsightItemSourceCategory.ActivityReward,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyActivityDefinition: ActivityHashes.TrialsOfOsiris3148168425 },
				description: { DestinyActivityDefinition: ActivityHashes.TrialsOfOsiris3148168425 },
				icon: { DestinyActivityModeDefinition: ActivityModeHashes.TrialsOfOsiris },
			}),
		},
		[DeepsightItemSourceType.ArmsWeekEvent]: {
			hash: DeepsightItemSourceType.ArmsWeekEvent,
			category: DeepsightItemSourceCategory.EventVendor,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyEventCardDefinition: EventCardHashes.ArmsWeek },
				subtitle: { DestinyVendorDefinition: { hash: VendorHashes.TowerShootingRangeAda, property: 'name' } },
				icon: { DestinyEventCardDefinition: EventCardHashes.ArmsWeek },
			}),
		},
		[DeepsightItemSourceType.SolsticeEvent]: {
			hash: DeepsightItemSourceType.SolsticeEvent,
			category: DeepsightItemSourceCategory.EventReward,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyEventCardDefinition: EventCardHashes.Solstice },
				icon: { DestinyEventCardDefinition: EventCardHashes.Solstice },
			}),
		},
		[DeepsightItemSourceType.Kepler]: {
			hash: DeepsightItemSourceType.Kepler,
			category: DeepsightItemSourceCategory.Destination,
			displayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyPresentationNodeDefinition: PresentationNodeHashes.Kepler },
				subtitle: { DestinyActivityDefinition: ActivityHashes.TheEdgeOfFate_PlaceHash4076196532 },
				icon: { DestinyPresentationNodeDefinition: { hash: PresentationNodeHashes.Kepler, iconSequence: 1, frame: 0 } },
			}),
		},
	}

	await fs.mkdir('docs/manifest', { recursive: true })
	await fs.writeJson('docs/manifest/DeepsightItemSourceListDefinition.json', DeepsightItemSourceListDefinition, { spaces: '\t' })
	await fs.writeJson('docs/manifest/DeepsightItemSourceDefinition.json', DeepsightItemSourceDefinition, { spaces: '\t' })
})

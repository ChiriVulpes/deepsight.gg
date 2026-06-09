import type { DestinyEventCardDefinition } from 'bungie-api-ts/destiny2'
import View from 'component/core/View'
import FilterAmmo from 'component/display/filter/FilterAmmo'
import FilterBreakerType from 'component/display/filter/FilterBreakerType'
import FilterElement from 'component/display/filter/FilterElement'
import FilterRarity from 'component/display/filter/FilterRarity'
import FilterSource from 'component/display/filter/FilterSource'
import FilterWeaponFoundry from 'component/display/filter/FilterWeaponFoundry'
import FilterWeaponFrame from 'component/display/filter/FilterWeaponFrame'
import FilterWeaponType from 'component/display/filter/FilterWeaponType'
import SortAmmo from 'component/display/sort/definition/SortAmmo'
import SortBucket from 'component/display/sort/definition/SortBucket'
import SortDamage from 'component/display/sort/definition/SortDamage'
import SortExotic from 'component/display/sort/definition/SortExotic'
import SortFoundry from 'component/display/sort/definition/SortFoundry'
import SortLocked from 'component/display/sort/definition/SortLocked'
import SortMasterwork from 'component/display/sort/definition/SortMasterwork'
import SortName from 'component/display/sort/definition/SortName'
import SortPower from 'component/display/sort/definition/SortPower'
import SortQuantity from 'component/display/sort/definition/SortQuantity'
import SortRarity from 'component/display/sort/definition/SortRarity'
import SortSetBonus from 'component/display/sort/definition/SortSetBonus'
import SortSource from 'component/display/sort/definition/SortSource'
import SortStatTotal from 'component/display/sort/definition/SortStatTotal'
import SortStun from 'component/display/sort/definition/SortStun'
import SortWeaponType from 'component/display/sort/definition/SortWeaponType'
import DisplayBar from 'component/DisplayBar'
import Overlay from 'component/Overlay'
import ItemOverlay from 'component/overlay/ItemOverlay'
import Moment, { FILTER_CHANGING_CLASS } from 'component/view/collections/Moment'
import type { CollectionsMoment } from 'conduit.deepsight.gg/item/Collections'
import type { InventoryBucketHashes } from 'deepsight.gg/Enums'
import type { DeepsightDisplayPropertiesDefinition } from 'deepsight.gg/Interfaces'
import { Component, State } from 'kitsui'
import Loading from 'kitsui/component/Loading'
import Slot from 'kitsui/component/Slot'
import Task from 'kitsui/utility/Task'
import type { ItemRefNames as ItemRefNamesValue } from 'model/ItemRefNames'
import ItemRefNames from 'model/ItemRefNames'
import type { ItemReference, ItemStateOptional } from 'model/Items'
import { ItemState } from 'model/Items'
import type { RoutePath } from 'navigation/RoutePath'
import Relic from 'Relic'
import { sleep } from 'utility/Async'
import ConduitBroadcastHandler from 'utility/ConduitBroadcastHandler'
import Diagnostic from 'utility/Diagnostic'
import Time from 'utility/Time'

const COLLECTIONS_DISPLAY = DisplayBar.Config({
	id: 'collections',
	sortConfig: {
		definitions: [
			SortName,
			SortPower,
			SortRarity,
			SortExotic,
			SortWeaponType,
			SortAmmo,
			SortDamage,
			SortStun,
			SortQuantity,
			SortStatTotal,
			SortMasterwork,
			SortLocked,
			SortFoundry,
			SortSource,
			SortSetBonus,
			SortBucket,
		],
		default: [
			{ id: 'rarity' },
			{ id: 'setbonus' },
			{ id: 'source' },
			{ id: 'bucket' },
			{ id: 'ammo' },
			{ id: 'type' },
			{ id: 'name' },
		],
	},
	filterConfig: {
		id: 'collections',
		filters: [FilterElement, FilterAmmo, FilterBreakerType, FilterWeaponType, FilterWeaponFrame, FilterWeaponFoundry, FilterSource, FilterRarity],
		debounceTime: 500,
	},
})

export interface CollectionsParamsItemHash {
	itemHash: string
}
export interface CollectionsParamsItemName {
	moment: string
	itemName: string
}

export interface ItemNameMaps {
	nameToHash: Record<string, Record<string, number>>
	hashToName: Record<number, ItemRefNamesValue>
}

const ActiveEvent = State.Async(async () => {
	const conduit = await Relic.connected
	const [DeepsightStats, DestinyEventCardDefinition] = await Promise.all([
		conduit.definitions.en.DeepsightStats.all(),
		conduit.definitions.en.DestinyEventCardDefinition.all(),
	])
	const event = DestinyEventCardDefinition[DeepsightStats.activeEvent!] as DestinyEventCardDefinition | undefined
	if (!event || (event.endTime && Date.now() > +event.endTime * 1000))
		return undefined

	return event
})

export default View<CollectionsParamsItemHash | CollectionsParamsItemName | undefined>(async view => {
	view.displayBarConfig.value = COLLECTIONS_DISPLAY

	view.style('collections-view')
		.style.bind(view.loading.loaded, 'collections-view--ready')

	const changingFilter = State(false)

	view.title
		.style('collections-view-title')
		.text.set(quilt => quilt['view/collections/title']())
		.appendWhen(changingFilter, Loading().showForever().style('collections-view-title-loading'))

	const { signal, setProgress } = await view.loading.start()
	setProgress(null, quilt => quilt['view/collections/load/connecting']())
	const conduit = await Relic.connected
	if (signal.aborted)
		return

	setProgress(null, quilt => quilt['view/collections/load/fetching']())
	const collections = State(await conduit.getCollections())
	if (signal.aborted)
		return

	await view.loading.finish()

	collections.useManual(collections => {
		ConduitBroadcastHandler.provider.value = collections
		Diagnostic.add({ collections })
	})

	const homeLinkURL = navigate.state.map(view, url => {
		const route = new URL(url).pathname as RoutePath
		return route === '/collections' ? '/' : '/collections'
	})

	view.getNavbar()
		?.overrideHomeLink(homeLinkURL, view)

	////////////////////////////////////
	//#region Collections

	const filterText = State<string | undefined>(undefined)
	const filterTextSource = view.displayHandlers.map(view, display => display?.filter.filterText)
	filterText.value = filterTextSource.value
	filterTextSource.subscribe(view, async text => {
		changingFilter.value = true
		await Task.yield()
		// await ViewTransition.perform("subview", 'collections-content', async () => {
		filterText.value = text
		while (view.element?.getElementsByClassName(FILTER_CHANGING_CLASS).length)
			await sleep(10)
		// }).finished
		changingFilter.value = false
	})

	let isFirstSeason = true
	let isFirstExpac = true

	Slot().subviewTransition('collections-content').appendTo(view).use({ collections, ActiveEvent }, (slot, { collections, ActiveEvent }) => {
		////////////////////////////////////
		//#region Active Event

		if (ActiveEvent) {
			const eventWrapper = Component()
				.style('collections-view-year', 'collections-view-year--event')

			const eventBuckets = collections.moments
				.flatMap(m => Object.entries(m.buckets))
				.groupBy(
					([bucketHash]) => +bucketHash as InventoryBucketHashes,
					bucketEntries => bucketEntries.map(([, bucket]) => bucket),
				)
				.toObject(([bucketHash, buckets]) => [bucketHash, {
					items: (buckets
						.flatMap(b => b.items)
						.filter(itemHash => collections.items[itemHash]?.sources?.some(source => source.type === 'defined' && collections.sources[source.id]?.event === ActiveEvent.hash))
					),
				}])

			const existingMoment = collections.moments.find(m => m.moment.event === ActiveEvent.hash)
			const moment: CollectionsMoment = existingMoment
				? {
					...existingMoment,
					buckets: {
						...existingMoment.buckets,
						...Object.fromEntries(Object.entries(eventBuckets).map(([bucketHash, bucket]) => [
							bucketHash,
							{
								items: [
									...(existingMoment.buckets[+bucketHash as InventoryBucketHashes.KineticWeapons]?.items ?? []),
									...bucket.items,
								].distinct(),
							},
						])),
					},
				}
				: {
					buckets: eventBuckets as CollectionsMoment['buckets'],
					moment: {
						hash: ActiveEvent.hash,
						id: (ActiveEvent.displayProperties.name
							.toLowerCase()
							// .replace(/['"&:()-]/g, '')
							.replace(/[^a-z]+/g, '')
							.trim()
						),
						iconWatermark: '',
						displayProperties: ActiveEvent.displayProperties as DeepsightDisplayPropertiesDefinition,
						primaryImage: ActiveEvent.images.themeBackgroundImagePath,
						images: !ActiveEvent.images.themeBackgroundImagePath ? undefined : [ActiveEvent.images.themeBackgroundImagePath],
					},
				}

			const momentComponent = Moment(moment, collections, view.displayHandlers).appendTo(eventWrapper)
			momentComponent.open.value = true
			momentComponent.manualOpenState.value = true

			if (ActiveEvent.endTime)
				Component()
					.style('collections-view-moment-title-time-remaining')
					.text.bind(Time.state.map(momentComponent, time => Math.floor(time / 60)).map(momentComponent, minute => {
						const timeRemaining = (+ActiveEvent.endTime - minute * 60) * 1000
						return quilt => quilt['view/collections/event-ends'](Time.translateDuration(timeRemaining)(quilt))
					}))
					.appendTo(momentComponent.summary)

			const shouldShow = State.Map(momentComponent, [filterText, momentComponent.hasAnyItemFilteredIn], (filterText, hasAnyItemFilteredIn) => !filterText || hasAnyItemFilteredIn)
			eventWrapper.appendToWhen(shouldShow, slot)
		}

		//#endregion
		////////////////////////////////////

		////////////////////////////////////
		//#region Moments by Year

		let year: number | undefined = NaN
		let yearWrapper: Component | undefined
		let yearMomentVisibilityStates: State<boolean>[] = []
		for (const moment of collections.moments) {
			if (typeof moment.moment.event === 'number' && moment.moment.event === ActiveEvent?.hash)
				continue

			if (moment.moment.year !== year) {
				handleYearWrapperEnd()

				year = moment.moment.year
				yearWrapper = !year ? undefined : Component()
					.style('collections-view-year')
					.append(Component()
						.style('collections-view-year-label')
						.text.set(quilt => quilt['view/collections/year'](year))
					)
			}

			const momentComponent = Moment(moment, collections, view.displayHandlers)

			if (moment.moment.expansion && isFirstExpac) {
				isFirstExpac = false
				if (!filterText.value) {
					momentComponent.open.value = true
					momentComponent.manualOpenState.value = true
				}
			}
			else if (moment.moment.season !== undefined && isFirstSeason) {
				isFirstSeason = false
				if (!filterText.value) {
					momentComponent.open.value = true
					momentComponent.manualOpenState.value = true
				}
			}

			const shouldShow = State.Map(momentComponent, [filterText, momentComponent.hasAnyItemFilteredIn], (filterText, hasAnyItemFilteredIn) => !filterText || hasAnyItemFilteredIn)
			yearMomentVisibilityStates.push(shouldShow)
			momentComponent.appendToWhen(shouldShow, yearWrapper ?? slot)
		}

		handleYearWrapperEnd()
		function handleYearWrapperEnd () {
			if (!yearWrapper)
				return

			const momentVisibilityStates = yearMomentVisibilityStates.slice()
			yearMomentVisibilityStates = []
			const shouldShow = State.Map(yearWrapper, momentVisibilityStates, (...states) => states.includes(true))
			yearWrapper.appendToWhen(shouldShow, slot)
		}

		//#endregion
		////////////////////////////////////
	})

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Item Overlay

	const itemMap = collections.mapManual((collections): ItemNameMaps => {
		const nameToHash = Object.fromEntries(collections.moments.map(moment => [moment.moment.id,
		Object.fromEntries(Object.values(moment.buckets)
			.flatMap(bucket => bucket.items)
			.map(hash => {
				const item = collections.items[hash]
				const itemRefName = item.displayProperties.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, ' ')
					.trim()
					.replaceAll(' ', '-')
				ItemRefNames.set(item, { moment: moment.moment.id, item: itemRefName })
				return [itemRefName, item.hash]
			})
		),
		]))

		const hashToName = Object.fromEntries(Object.entries(nameToHash)
			.flatMap(([momentName, momentMap]) => (
				Object.entries(momentMap)
					.map(([itemName, itemHash]) => [
						itemHash,
						{ moment: momentName, item: itemName },
					])
			))
		)

		return { nameToHash, hashToName }
	})
	const overlayState = State.Map(view, [view.params, collections, itemMap], (params, collections, itemMap): ItemStateOptional => {
		if (!params)
			return ItemState.resolve(undefined, collections)

		const result: ItemReference | undefined = 'itemHash' in params
			? { is: 'item-reference', hash: +params.itemHash }
			: 'itemName' in params
				? { is: 'item-reference', hash: itemMap.nameToHash[params.moment]?.[params.itemName] }
				: undefined

		if (result !== undefined) {
			view.loading.skipViewTransition()
			return ItemState.resolve(result, collections)
		}

		return ItemState.resolve(undefined, collections)
	})

	Overlay(view).and(ItemOverlay, overlayState).bind(overlayState.map(view, s => !!s.definition))

	//#endregion
	////////////////////////////////////
})

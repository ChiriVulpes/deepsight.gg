import View from 'component/core/View'
import DisplayBar from 'component/DisplayBar'
import Overlay from 'component/Overlay'
import ItemOverlay from 'component/overlay/ItemOverlay'
import Moment from 'component/view/collections/Moment'
import type { Item } from 'conduit.deepsight.gg/Collections'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import Relic from 'Relic'

const COLLECTIONS_DISPLAY = DisplayBar.Config({
	id: 'collections',
	sortConfig: {},
	filterConfig: {},
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
	hashToName: Record<number, ItemRefNames>
}

export interface ItemRefNames {
	moment: string
	item: string
}

declare module 'conduit.deepsight.gg/Collections' {
	export interface Item {
		refNames: ItemRefNames
	}
}

export default View<CollectionsParamsItemHash | CollectionsParamsItemName | undefined>(async view => {
	view.style('collections-view')
		.style.bind(view.loading.loaded, 'collections-view--ready')

	Component()
		.style('view-title')
		.viewTransitionSwipe('collections-view-title')
		.text.set(quilt => quilt['view/collections/title']())
		.appendTo(view)

	view.loading.appendTo(view)

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

	collections.useManual(collections => console.log('Collections:', collections))

	////////////////////////////////////
	//#region Collections

	view.displayBarConfig.value = COLLECTIONS_DISPLAY

	const filterText = view.displayHandlers.map(view, display => display?.filter.filterText)

	Slot().appendTo(view).use(collections, (slot, collections) => {
		let year: number | undefined = NaN
		let yearWrapper: Component | undefined
		let yearMomentVisibilityStates: State<boolean>[] = []
		for (const moment of collections.moments) {
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
			const shouldShow = State.Map(momentComponent, [momentComponent.open, filterText], (open, filterText) => open || !filterText)
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
				item.refNames = { moment: moment.moment.id, item: itemRefName }
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
	const overlayItem = State.Map(view, [view.params, collections, itemMap], (params, collections, itemMap): Item | undefined => {
		if (!params)
			return undefined

		const result = 'itemHash' in params
			? collections.items[+params.itemHash] ?? undefined
			: 'itemName' in params
				? collections.items[itemMap.nameToHash[params.moment]?.[params.itemName]] ?? undefined
				: undefined

		if (result !== undefined) {
			view.loading.skipViewTransition()
			return result
		}
	})

	Overlay(view).bind(overlayItem.truthy).and(ItemOverlay, overlayItem, collections)

	//#endregion
	////////////////////////////////////
})

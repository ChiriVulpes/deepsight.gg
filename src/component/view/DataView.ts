import Details from 'component/core/Details'
import Paginator from 'component/core/Paginator'
import View from 'component/core/View'
import DisplayBar from 'component/DisplayBar'
import Overlay from 'component/Overlay'
import type { DataOverlayParams } from 'component/overlay/DataOverlay'
import DataOverlay from 'component/overlay/DataOverlay'
import DataDefinitionButton from 'component/view/data/DataDefinitionButton'
import DataHelper from 'component/view/data/DataHelper'
import DataProvider from 'component/view/data/DataProvider'
import type { AllComponentNames } from 'conduit.deepsight.gg/DefinitionComponents'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import Relic from 'Relic'

const PRIORITY_COMPONENTS: AllComponentNames[] = [
	'DestinyInventoryItemDefinition',
	'DestinyActivityDefinition',
	'DestinySandboxPerkDefinition',
	'DestinyStatDefinition',
	'DestinyTraitDefinition',
	'DestinyVendorDefinition',
	'DeepsightMomentDefinition',
	'DeepsightItemSourceListDefinition',
	'DeepsightPlugCategorisation',
	'ClarityDescriptions',
]

const DATA_DISPLAY = DisplayBar.Config({
	id: 'data',
	filterConfig: {
		id: 'data-filter',
		allowUppercase: true,
		filters: [],
	},
})

export interface DataParams {
	table: string
	hash: string
}

export default View<DataParams | undefined>(async view => {
	view.style('data-view')
		.style.bind(view.loading.loaded, 'data-view--ready')

	Component()
		.style('view-title')
		.viewTransitionSwipe('data-view-title')
		.text.set(quilt => quilt['view/data/title']())
		.appendTo(view)

	view.loading.appendTo(view)

	const { signal, setProgress } = await view.loading.start()
	setProgress(null, quilt => quilt['view/data/load/connecting']())
	const conduit = await Relic.connected
	if (signal.aborted)
		return

	setProgress(null, quilt => quilt['view/data/load/fetching']())
	const componentNames = State(await conduit.getComponentNames())
	if (signal.aborted)
		return

	await view.loading.finish()

	view.displayBarConfig.value = DATA_DISPLAY
	const filterText = view.displayHandlers.map(view, display => display?.filter.filterText)

	componentNames.useManual(componentNames => console.log('Component Names:', componentNames))

	Slot()
		.use({ componentNames, filterText }, (slot, { componentNames, filterText }) => {
			const indices = componentNames.toObject(name => [name, PRIORITY_COMPONENTS.indexOf(name) + 1 || Infinity])
			componentNames.sort((a, b) => indices[a] - indices[b])

			const dataPageProvider = DataProvider.createPaged(filterText)

			// if (!filterText) {
			for (const name of componentNames) {
				const details = Details()
					.style('collections-view-moment')
					.tweak(details => details
						.style.bind(details.open, 'details--open', 'collections-view-moment--open')
						.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment--hover')
					)
					.viewTransitionSwipe(`data-view-component-${name}`)
					.appendTo(slot)

				details.summary
					.style('collections-view-moment-summary')
					.style.bind(details.open, 'collections-view-moment-summary--open')
					.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment-summary--hover')
					.text.set(DataHelper.getComponentName(name))

				const openedOnce = State(false)
				State.Some(details, openedOnce, details.open).useManual(opened => {
					if (!opened)
						return

					openedOnce.value = true

					const pageSize = 50
					Paginator()
						.style('data-view-component-paginator')
						.config({
							async get (page) {
								const state = dataPageProvider.get(name, pageSize, page)
								await state.promise
								return state.value
							},
							init (paginator, slot, page, data) {
								const list = Component()
									.style('data-view-definition-list')
									.appendTo(slot)

								for (let i = -5; i <= 5; i++)
									dataPageProvider.prep(name, pageSize, page + i)

								if (!data) {
									console.error('Failed to load definitions page')
									return
								}

								paginator.setTotalPages(Math.max(paginator.getTotalPages(), data.totalPages))
								for (const [, definition] of Object.entries(data.definitions) as [string, { hash: number }][]) {
									DataProvider.SINGLE.prep(name, definition.hash)
									DataDefinitionButton()
										.tweak(button => button.data.value = { component: name, definition })
										.appendTo(list)
								}
							},
						})
						.appendTo(details.content)
				})
			}

			return
			// }
		})
		.appendTo(view)

	////////////////////////////////////
	//#region Data Overlay

	const overlayDefinition = State.Async(view, view.params, async (params, signal, setProgress) => {
		if (!params)
			return undefined

		const result = DataProvider.SINGLE.get(params.table as AllComponentNames, params.hash)
		if (!result || signal.aborted)
			return undefined

		await result.promise
		if (signal.aborted || !result.value)
			return undefined

		view.loading.skipViewTransition()
		return {
			table: params.table as AllComponentNames,
			hash: params.hash,
			definition: result.value.definition,
			links: result.value.links,
		} satisfies DataOverlayParams
	})

	Overlay(view).bind(overlayDefinition.truthy).and(DataOverlay, overlayDefinition)

	//#endregion
	////////////////////////////////////
})

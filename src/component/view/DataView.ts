import Details from 'component/core/Details'
import View from 'component/core/View'
import DisplayBar from 'component/DisplayBar'
import DataComponentHelper from 'component/view/data/DataComponentHelper'
import DataDefinitionButton from 'component/view/data/DataDefinitionButton'
import type { AllComponentNames } from 'conduit.deepsight.gg/DefinitionComponents'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import AbortablePromise from 'kitsui/utility/AbortablePromise'
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
	sortConfig: {},
	filterConfig: {
		id: 'data-filter',
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

			if (!filterText) {
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
						.text.set(DataComponentHelper.getComponentName(name))

					const list = Component()
						.style('data-view-definition-list')
						.appendTo(details.content)

					details.open.useManual(AbortablePromise.throttled(async (signal, opened) => {
						if (!opened)
							return

						const conduit = await Relic.connected
						const definitions = await conduit.definitions.en[name].all()
						for (const [, definition] of Object.entries(definitions)) {
							DataDefinitionButton()
								.tweak(button => button.data.value = { component: name, definition })
								.appendTo(list)
						}
					}))
				}

				return
			}
		})
		.appendTo(view)
})

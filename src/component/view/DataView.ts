import Details from 'component/core/Details'
import DisplaySlot from 'component/core/DisplaySlot'
import Link from 'component/core/Link'
import Paginator from 'component/core/Paginator'
import TabButton from 'component/core/TabButton'
import View from 'component/core/View'
import { FilterToken, PLAINTEXT_FILTER_TWEAK_CHIP } from 'component/display/Filter'
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
import type { RoutePath } from 'navigation/RoutePath'
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
		debounceTime: 500,
		filters: [],
		plaintextFilterTweakChip (chip, token) {
			if (token.lowercase.startsWith('deep:'))
				token = FilterToken.create(token.slice(5))

			PLAINTEXT_FILTER_TWEAK_CHIP(chip, token)
		},
		plaintextFilterIsValid (token) {
			if (token.lowercase.startsWith('deep:'))
				token = FilterToken.create(token.slice(5))
			return token.lowercase.length >= 3
		},
	},
})

interface Breadcrumb {
	path: RoutePath
	name: string
}

namespace Breadcrumb {
	export function equals (a?: Breadcrumb, b?: Breadcrumb) {
		return a?.path === b?.path && a?.name === b?.name
	}
}

export interface DataParams {
	table: string
	hash: string
	augmentation?: string
}

export interface DataParamsWithAugmentation extends DataParams {
	augmentation: string
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

				const filteredIn = State(false)
				if (!filterText)
					details.appendTo(slot)
				else
					details.appendToWhen(filteredIn, slot)

				details.summary
					.style('collections-view-moment-summary')
					.style.bind(details.open, 'collections-view-moment-summary--open')
					.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment-summary--hover')
					.text.set(DataHelper.getComponentName(name))

				const openedOnce = State(!!filterText)
				State.Some(details, openedOnce, details.open).useManual(opened => {
					if (!opened)
						return

					openedOnce.value = true

					const pageSize = 50
					const isInitialInit = true
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

								if (!data) {
									console.error('Failed to load definitions page')
									return
								}

								for (let i = -5; i <= 5; i++)
									if (page + i >= 0 && page + i < data.totalPages)
										dataPageProvider.prep(name, pageSize, page + i)

								if (isInitialInit && data.totalPages && filterText) {
									details.open.value = true
									filteredIn.value = true
								}

								paginator.setTotalPages(!data.totalPages ? 0 : Math.max(paginator.getTotalPages(), data.totalPages))
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

	const breadcrumbs = State<Breadcrumb[]>([])

	const homeLinkURL = navigate.state.map(view, url => {
		const route = new URL(url).pathname as RoutePath
		return route === '/data' ? '/' : '/data'
	})

	view.getNavbar()
		?.overrideHomeLink(homeLinkURL, view)
		.append(DisplaySlot()
			.style('data-view-breadcrumbs-wrapper')
			.setOwner(view)
			.use(breadcrumbs, (slot, crumbs) => {
				const wrapper = Component()
					.style('data-view-breadcrumbs')
					.appendTo(slot)

				const navigatePath = navigate.state.map(slot, url => new URL(url).pathname as RoutePath)
				for (const breadcrumb of crumbs) {
					const componentName = breadcrumb.path.slice(6).split('/')[0] as AllComponentNames
					const selected = navigatePath.equals(breadcrumb.path)
					TabButton(selected)
						.and(Link, breadcrumb.path)
						.style('data-view-breadcrumbs-button')
						.text.set(breadcrumb.name)
						.append(Component()
							.style('data-view-breadcrumbs-button-component')
							.text.set(DataHelper.getComponentName(componentName, true))
						)
						.event.subscribe('auxclick', e => {
							if (e.button !== 1)
								// only handle middle-clicks
								return

							const index = crumbs.indexOf(breadcrumb)
							if (index !== -1)
								breadcrumbs.value.splice(index, 1)

							if (selected.value)
								void navigate.toURL(breadcrumbs.value[index - 1]?.path ?? breadcrumbs.value[index]?.path ?? '/data')

							e.host.remove()
							e.preventDefault()
						})
						.prependTo(wrapper)
				}
			})
		)

	////////////////////////////////////
	//#region Data Overlay

	const overlayDefinition = State.Async(view, view.params, async (params, signal, setProgress) => {
		if (!params)
			return undefined

		const result = DataProvider.SINGLE.get(params.table as AllComponentNames, params.hash)
		if (!result)
			return undefined

		view.loading.skipViewTransition()
		await result.promise
		if (signal.aborted || !result.value)
			return undefined

		const table = params.table as AllComponentNames
		const newBreadcrumb: Breadcrumb = {
			path: `/data/${table}/${params.hash}`,
			name: DataHelper.getTitle(table, result.value.definition),
		}
		if (!breadcrumbs.value.some(bc => Breadcrumb.equals(bc, newBreadcrumb)))
			breadcrumbs.value = [...breadcrumbs.value, newBreadcrumb]

		return {
			table,
			hash: params.hash,
			definition: result.value.definition,
			links: result.value.links,
		} satisfies DataOverlayParams
	})

	const hasPendingOverlayDefinition = State.Every(view, view.params.truthy, overlayDefinition.settled.falsy)
	Overlay(view).bind(State.Some(view, overlayDefinition.truthy, hasPendingOverlayDefinition)).and(DataOverlay, overlayDefinition)

	//#endregion
	////////////////////////////////////
})

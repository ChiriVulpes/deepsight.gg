import Button from 'component/core/Button'
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
import Loading from 'kitsui/component/Loading'
import Slot from 'kitsui/component/Slot'
import { Truthy } from 'kitsui/utility/Arrays'
import Functions from 'kitsui/utility/Functions'
import type { Quilt, Weave } from 'lang'
import quilt from 'lang'
import type { RoutePath } from 'navigation/RoutePath'
import type { DeepsightLinksDefinition } from 'node_modules/deepsight.gg/Interfaces'
import Relic from 'Relic'
import { sleep } from 'utility/Async'
import { _ } from 'utility/Objects'
import Time from 'utility/Time'

enum CategoryId {
	Constants,
}

const PRIORITY_COMPONENTS: (AllComponentNames | CategoryId)[] = [
	'DestinyInventoryItemDefinition',
	'DestinySandboxPerkDefinition',
	'DestinyStatDefinition',
	'DestinyTraitDefinition',
	'DeepsightMomentDefinition',
	'DestinyVendorDefinition',
	'DestinyActivityDefinition',
	'DestinyActivityModifierDefinition',
	'DestinyRecordDefinition',
	'DestinyDestinationDefinition',
	'DestinyPlaceDefinition',
	CategoryId.Constants,
]

const SINGLE_DEF_COMPONENTS: AllComponentNames[] = [
	'DeepsightStats',
	'DeepsightLinksDefinition',
	'DeepsightVariantDefinition',
]

const HIDDEN_COMPONENTS: AllComponentNames[] = [
	'DestinyRewardSourceDefinition', // unused, completely empty
	'DestinyInventoryItemLiteDefinition' as AllComponentNames,
	'DestinyBondDefinition' as AllComponentNames, // has defs, but completely unused
	'DeepsightIconDefinition', // functionally augmentations, but links differently
]

interface ComponentCategory {
	id?: CategoryId
	name: string | Quilt.Handler
	components?: AllComponentNames[]
	componentFilter?(component: AllComponentNames, links: DeepsightLinksDefinition | undefined): boolean
}
const COMPONENT_CATEGORIES: ComponentCategory[] = [
	{
		id: CategoryId.Constants,
		name: quilt => quilt['view/data/component/category/constants'](),
		components: ['DeepsightStats'],
		componentFilter: component => component.includes('Constants'),
	},
	{
		name: quilt => quilt['view/data/component/category/fireteam-finder'](),
		componentFilter: component => component.includes('FireteamFinder'),
	},
	{
		name: quilt => quilt['view/data/component/category/activity-skulls'](),
		componentFilter: component => component.includes('Activity') && component.includes('Skull'),
	},
	{
		name: quilt => quilt['view/data/component/category/loadouts'](),
		components: [
			'DestinyLoadoutNameDefinition',
			'DestinyLoadoutIconDefinition',
			'DestinyLoadoutColorDefinition',
		],
	},
	{
		name: quilt => quilt['view/data/component/category/character-customisation'](),
		components: [
			'DestinyRaceDefinition',
			'DestinyGenderDefinition',
		],
		componentFilter: component => component.includes('CharacterCustomization'),
	},
	{
		name: quilt => quilt['view/data/component/category/augmentations'](),
		componentFilter: (component, links) => Object.values(links?.components ?? {}).some(links => links.augmentations?.includes(component)),
	},
]

const isSingleDefComponent = (componentName: AllComponentNames) => {
	return false
		|| SINGLE_DEF_COMPONENTS.includes(componentName)
		|| componentName.endsWith('ConstantsDefinition')
}

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
	name: string | Quilt.Handler
}

namespace Breadcrumb {
	export function equals (a?: Breadcrumb, b?: Breadcrumb) {
		return a?.path === b?.path && getBreadcrumbName(a) === getBreadcrumbName(b)
	}

	function getBreadcrumbName (breadcrumb?: Breadcrumb): string {
		return Functions.resolve<[Quilt], string | Weave | undefined>(breadcrumb?.name, quilt)?.toString() ?? ''
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

const currentTime = State(Date.now())
setInterval(() => currentTime.value = Date.now(), 100)

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

	const lastCheck = State<number | undefined>(undefined)

	const state = State.Async(view, async () => {
		lastCheck.value = undefined
		const state = await conduit.checkUpdate()
		lastCheck.value = Date.now()
		return state
	})

	// give just a bit of time to make sure that check update is the first set of requests that goes out from conduit
	await sleep(10)
	if (signal.aborted)
		return

	const componentNames = State.Async(view, () => conduit.getComponentNames())
	const links = State.Async(view, () => conduit.definitions.en.DeepsightLinksDefinition.all())

	// wait for the ones required for rendering
	await Promise.all([state.promise, componentNames.promise, links.promise])
	if (signal.aborted)
		return

	state.useManual(state => {
		if (!state?.version.updated)
			return

		componentNames.refresh()
		links.refresh()
	})
	// when an update happened, list of components might be refreshing, so await it once more
	await componentNames.promise
	if (signal.aborted)
		return

	await view.loading.finish()
	if (signal.aborted)
		return

	////////////////////////////////////
	//#region Versions & Update
	Loading()
		.style('data-view-versions')
		.setNormalTransitions()
		.tweak(wrapper => wrapper.set(state, (slot, currentState) => {
			const simplified = {
				...currentState.version,
				destiny: currentState.version.destiny.split('.').at(-1)!,
				combined: undefined,
				updated: undefined,
			}
			Component()
				.style('data-view-versions-text')
				.append(
					Component().style('data-view-versions-text-provider').text.set(quilt => quilt['view/data/versions/label']()),
					Component().style('data-view-versions-text-punctuation').text.set(': '),
				)
				.append(...Object.entries(simplified)
					.filter(([, version]) => version)
					.flatMap(([provider, version], i) => [
						i && Component().style('data-view-versions-text-punctuation').text.set(' / '),
						Component().style('data-view-versions-text-version').text.set(version),
					])
					.filter(Truthy)
				)
				.appendToWhen(wrapper.hoveredOrHasFocused.falsy, slot)

			const full = {
				...currentState.version,
				combined: undefined,
				updated: undefined,
			}
			Component()
				.style('data-view-versions-text')
				.append(...Object.entries(full)
					.filter(([, version]) => version)
					.flatMap(([provider, version], i) => [
						i && Component().style('data-view-versions-text-punctuation').text.set(' / '),
						Component().style('data-view-versions-text-provider').text.set(provider),
						Component().style('data-view-versions-text-punctuation').text.set(': '),
						Component().style('data-view-versions-text-version').text.set(version),
					])
					.filter(Truthy)
				)
				.appendToWhen(wrapper.hoveredOrHasFocused, slot)

			Component()
				.style('data-view-versions-action-list')
				.append(Button()
					.style('data-view-versions-action-button')
					.tweak(button => button
						.text.bind(State.Map(slot, [currentTime, lastCheck, button.hoveredOrHasFocused], (elapsed, last, hovered) => quilt => quilt['view/data/versions/action/check'](!last || !hovered ? undefined : Time.relative(last, { components: 1 }))))
					)
					.event.subscribe('click', () => state.refresh())
				)
				.appendTo(slot)
		}))
		.appendTo(view)

	//#endregion
	////////////////////////////////////

	view.displayBarConfig.value = DATA_DISPLAY
	const filterText = view.displayHandlers.map(view, display => display?.filter.filterText)

	componentNames.useManual(componentNames => console.log('Component Names:', componentNames))

	Slot()
		.use({ componentNames, links, filterText }, (slot, { componentNames, links, filterText }) => {
			if (!componentNames)
				return

			componentNames = componentNames.filter(name => !HIDDEN_COMPONENTS.includes(name))

			const componentNameGroups = componentNames
				.groupBy((name, i) => {
					for (const category of COMPONENT_CATEGORIES) {
						const isInCategory = false
							|| category.components?.includes(name)
							|| category.componentFilter?.(name, links)

						if (!isInCategory)
							continue

						return category
					}
				})
				.filter((entry): entry is [ComponentCategory, AllComponentNames[]] => !!entry[0])

			const indices = componentNames.toObject(name => [
				name,
				(_
					|| PRIORITY_COMPONENTS.indexOf(name) + 1
					// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
					|| PRIORITY_COMPONENTS.indexOf(componentNameGroups.find(([category, names]) => names.includes(name))?.[0].id!) + 1
					|| Infinity
				),
			])
			componentNames.sort((a, b) => indices[a] - indices[b])

			const dataPageProvider = DataProvider.createPaged(filterText)

			interface GroupWrapper {
				readonly details: Details
				readonly filteredIn: State.Mutable<boolean>
				readonly filteredInStates: State<boolean>[]
			}
			const groupWrappers: Map<ComponentCategory, GroupWrapper> = new Map()
			// if (!filterText) {
			for (let i = 0; i < componentNames.length; i++) {
				const name = componentNames[i]

				const [category] = componentNameGroups.find(([category, names]) => names.includes(name)) ?? []
				if (category && !groupWrappers.has(category)) {
					const filteredIn = State(false)
					groupWrappers.set(category, {
						details: Details()
							.style('collections-view-moment', 'data-view-component-category')
							.style.toggle(!!filterText, 'data-view-component-category--flat')
							.viewTransitionSwipe(`data-view-component-${name}-category`)
							.tweak(details => details
								.style.bind(details.open, 'details--open', 'collections-view-moment--open')
								.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment--hover')
							)
							.tweak(details => details.summary
								.style('collections-view-moment-summary', 'data-view-component-category-summary')
								.style.toggle(!!filterText, 'data-view-component-category--flat-summary')
								.style.bind(details.open, 'collections-view-moment-summary--open', 'data-view-component-category-summary--open')
								.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment-summary--hover')
								.text.set(category.name)
							)
							.tweak(details => details.content
								.style('data-view-component-category-content')
								.style.toggle(!!filterText, 'data-view-component-category--flat-content')
							)
							.tweak(details => {
								if (!filterText) {
									details.appendTo(slot)
									return
								}

								details.appendToWhen(filteredIn, slot)
								details.open.value = true
							}),
						filteredIn,
						filteredInStates: [],
					})
				}

				const categoryWrapper = groupWrappers.get(category!)

				const details = Details()
					.style('collections-view-moment')
					.tweak(details => details
						.style.bind(details.open, 'details--open', 'collections-view-moment--open')
						.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment--hover')
					)
					.viewTransitionSwipe(`data-view-component-${name}`)

				const filteredIn = State(false)
				categoryWrapper?.filteredInStates.push(filteredIn)
				if (!filterText)
					details.appendTo(categoryWrapper?.details.content ?? slot)
				else
					details.appendToWhen(filteredIn, categoryWrapper?.details.content ?? slot)

				const augments = Object.values(links?.components ?? {}).find(links => links.augmentations?.includes(name))?.component

				details.summary
					.style('collections-view-moment-summary', 'data-view-component-summary')
					.style.bind(details.open, 'collections-view-moment-summary--open')
					.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment-summary--hover')
					.text.set(DataHelper.getComponentName(name))
					.append(augments && Component()
						.style('data-view-component-summary-augments')
						.text.set(quilt => quilt['view/data/component/shared/augments'](DataHelper.getComponentName(augments)))
					)

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
								if (isSingleDefComponent(name)) {
									const keys = Object.keys(data.definitions)
									const singleDef = keys.length > 1 || typeof data.definitions[keys[0]] !== 'object' || !data.definitions[keys[0]]
										? data.definitions
										: data.definitions[keys[0]]
									DataDefinitionButton()
										.tweak(button => button.data.value = { component: name, definition: singleDef, singleDefComponent: true })
										.appendTo(list)
									return
								}

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

			// bind all group wrappers to base their filteredIn on their children's filteredIn
			for (const wrapper of groupWrappers.values()) {
				const filteredIn = State.Map(wrapper.details, wrapper.filteredInStates, (...states) => states.some(v => v))
				wrapper.filteredIn.bind(wrapper.details, filteredIn)
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

					const isFullViewOrSingleDefComponent = breadcrumb.path.endsWith('/full') || isSingleDefComponent(componentName)
					const [breadcrumbTitle, breadcrumbSubtitle] = isFullViewOrSingleDefComponent
						? [DataHelper.getComponentName(componentName, true), DataHelper.getComponentProvider(componentName)]
						: [breadcrumb.name, DataHelper.getComponentName(componentName, true)]

					TabButton(selected)
						.and(Link, breadcrumb.path)
						.style('data-view-breadcrumbs-button')
						.text.set(breadcrumbTitle)
						.append(Component()
							.style('data-view-breadcrumbs-button-component')
							.text.set(breadcrumbSubtitle)
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

		const table = params.table as AllComponentNames
		const result = params.hash !== 'full'
			? DataProvider.SINGLE.get(table, params.hash)
			////////////////////////////////////
			//#region Full Table Data
			: State.Async(State.Owner.fromSignal(signal), async (): Promise<{ definition: object, links?: undefined } | undefined> => {
				const conduit = await Relic.connected
				if (signal.aborted)
					return undefined

				const defs = await conduit.definitions.en[table].all()
				if (signal.aborted)
					return undefined

				if (!isSingleDefComponent(table))
					return { definition: defs }

				const keys = Object.keys(defs)
				const key = keys[0] as keyof typeof defs
				const singleDef = keys.length > 1 || typeof defs[key] !== 'object' || !defs[key]
					? defs
					: defs[key]
				return { definition: singleDef }
			})
		//#endregion
		////////////////////////////////////

		if (!result)
			return undefined

		view.loading.skipViewTransition()
		await result.promise
		if (signal.aborted || !result.value)
			return undefined

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
	const shouldShowOverlay = State.Some(view, overlayDefinition.truthy, hasPendingOverlayDefinition)
	Overlay(view).bind(shouldShowOverlay).and(DataOverlay, overlayDefinition)

	shouldShowOverlay.subscribeManual(show => {
		if (!show) {
			view.displayHandlers.value?.filter.reapplyFilterSearchParam()
		}
	})

	//#endregion
	////////////////////////////////////
})

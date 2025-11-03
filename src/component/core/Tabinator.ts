import Link from 'component/core/Link'
import TabButton from 'component/core/TabButton'
import { Component, State } from 'kitsui'
import type { RoutePath } from 'navigation/RoutePath'

interface TabExtensions {
	readonly content: Component
	readonly selected: State<boolean>
	bindEnabled (state?: State<boolean>): this
	setDefaultSelection (): this
	select (): void
}

export interface Tab extends Component, TabExtensions { }

interface TabinatorExtensions {
	readonly Tab: Component.Builder<[State.Or<RoutePath>?], Tab>
	readonly header: Component
	hideWhenSingleTab (): this
	setDisplayMode (mode: 'horizontal' | 'vertical'): this
}

interface Tabinator extends Component, TabinatorExtensions { }

const Tabinator = Component((component): Tabinator => {
	// eslint-disable-next-line prefer-const
	let Tab: Component.Builder<[State.Or<RoutePath>?], Tab>

	const displayMode = State<'horizontal' | 'vertical'>('horizontal')
	const hideWhenSingleTab = State(false)
	const isSingleTab = State.JIT((): boolean => !!Tab && [...tabsWrapper.getChildren(Tab)].length <= 1)

	const header = Component()
		.style('tabinator-header')
		.style.bind(displayMode.equals('vertical'), 'tabinator-header--vertical')
		.style.bind(State.Every(component, hideWhenSingleTab, isSingleTab), 'tabinator-header--hidden')
		.appendTo(component)

	const tabsWrapper = Component()
		.style('tabinator-header-sticky-wrapper')
		.style.bind(displayMode.equals('vertical'), 'tabinator-header-sticky-wrapper--vertical')
		.appendTo(header)

	const content = Component()
		.style('tabinator-content')
		.appendTo(component)

	let watchingNavigation = false
	const tabinatorId = Math.random().toString(36).slice(2)

	const tabinatorDirection = State<-1 | 1>(-1)
	const defaultSelection = State<Tab | undefined>(undefined)

	const currentURL = State<RoutePath | undefined>(undefined)

	Tab = Component((component, route?: State.Or<RoutePath>): Tab => {
		if ([...tabsWrapper.getChildren(Tab)].every(tab => !tab.selected.value))
			defaultSelection.value ??= component as Tab

		const selected = State(false)

		const isDefaultSelection = defaultSelection.equals(component as Tab)
		selected.bind(component, isDefaultSelection)

		const tabId = Math.random().toString(36).slice(2)

		const tabContent = Component()
			.style('tabinator-tab-content')
			.style.bind(selected.falsy, 'tabinator-tab-content--hidden')
			.ariaRole('tabpanel')
			.setId(`tabinator-${tabinatorId}-content-${tabId}`)
			.attributes.bind(selected.falsy, 'inert')
			.appendTo(content)

		if (route)
			component = component.and(Link, route)
				.tweak(link => link.overrideClick.value = false)

		const enabled = State(true)

		return component
			.and(TabButton, selected)
			.style('tabinator-tab-button')
			.style.bind(displayMode.equals('vertical'), 'tabinator-tab-button--vertical')
			.setDisplayMode(displayMode)
			.bindDisabled(enabled.falsy, 'bindEnabled')
			.tweak(b => b.style.bind(b.disabled, 'button--disabled', 'tab-button--disabled', 'tabinator-tab-button--disabled'))
			.ariaRole('tab')
			.setId(`tabinator-${tabinatorId}-tab-${tabId}`)
			.attributes.bind('aria-selected', selected.mapManual(isSelected => isSelected ? 'true' : 'false'))
			.ariaControls(tabContent)
			.extend<TabExtensions>(tab => ({
				selected,
				content: tabContent.ariaLabelledBy(tab),
				bindEnabled (state) {
					if (state)
						enabled.bind(tab, state)
					else
						enabled.value = true
					return tab
				},
				setDefaultSelection () {
					defaultSelection.value = tab
					return tab
				},
				select () {
					selectTab(tab)
				},
			}))
			.onRooted(tab => {
				if (route) {
					watchNavigation()
					State.Use(component, { currentURL, route: State.get(route) }, ({ currentURL, route }) => {
						if (currentURL === route)
							selectTab(component as Tab)
					})
				}

				tab.event.subscribe('click', e => {
					e.preventDefault()
					selectTab(tab)
					if (tab.is(Link))
						navigate.setURL(tab.href.value)
				})

				isSingleTab.markDirty()
			})
			.appendTo(tabsWrapper)
	})

	return component
		.style('tabinator')
		.style.bind(displayMode.equals('vertical'), 'tabinator--vertical')
		.style.bindVariable('tabinator-direction', tabinatorDirection)
		.extend<TabinatorExtensions>(tabinator => ({
			Tab,
			header,
			hideWhenSingleTab () {
				hideWhenSingleTab.value = true
				return tabinator
			},
			setDisplayMode (mode) {
				displayMode.value = mode
				return tabinator
			},
		}))

	function watchNavigation () {
		if (watchingNavigation)
			return

		watchingNavigation = true
		currentURL.bind(component, navigate.state.delay(component, 10).map(component, url => new URL(url).pathname as RoutePath))
	}

	function selectTab (newSelectedTab: Tab) {
		let previousSelectedTabIndex = Infinity
		let newSelectedTabIndex = -1
		const tabs = [...tabsWrapper.getChildren(Tab)]
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i]
			if (tab === newSelectedTab) {
				newSelectedTabIndex = i
				continue
			}

			if (tab.selected.value)
				previousSelectedTabIndex = Math.min(previousSelectedTabIndex, i)

			tab.selected.asMutable?.setValue(false)
		}

		tabinatorDirection.value = (Math.sign(newSelectedTabIndex - previousSelectedTabIndex) || -1) as -1 | 1
		newSelectedTab.selected.asMutable?.setValue(true)

		defaultSelection.value = undefined
	}
})

export default Tabinator

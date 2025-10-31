import Link from 'component/core/Link'
import TabButton from 'component/core/TabButton'
import { Component, State } from 'kitsui'
import type { RoutePath } from 'navigation/RoutePath'

interface TabExtensions {
	readonly content: Component
	readonly selected: State.Mutable<boolean>
	bindEnabled (state?: State<boolean>): this
}

export interface Tab extends Component, TabExtensions { }

interface TabinatorExtensions {
	readonly Tab: Component.Builder<[State.Or<RoutePath>?], Tab>
	/**
	 * For when this Tabinator has Link tabs — automatically updates the selected tab based on navigation changes.
	 */
	watchNavigation (): this
}

interface Tabinator extends Component, TabinatorExtensions { }

const Tabinator = Component((component): Tabinator => {
	const header = Component()
		.style('tabinator-header')
		.appendTo(component)

	const content = Component()
		.style('tabinator-content')
		.appendTo(component)

	const tabinatorId = Math.random().toString(36).slice(2)

	const tabinatorDirection = State<-1 | 1>(-1)

	const Tab = Component((component, route?: State.Or<RoutePath>): Tab => {
		const selected = State(route ? false : !header.getChildren(Tab).some(tab => tab.selected.value))
		if (route)
			selected.bind(component, State.Map(component, [navigate.state, State.get(route)], (navigateState, route) => {
				const navigatePath = new URL(navigateState).pathname
				return navigatePath === route
			}))

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
			.bindDisabled(enabled.falsy, 'bindEnabled')
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
			}))
			.onRooted(tab => {
				tab.event.subscribe('click', e => {
					e.preventDefault()
					selectTab(tab)
					if (tab.is(Link))
						navigate.setURL(tab.href.value)
				})
			})
			.appendTo(header)
	})

	return component
		.style('tabinator')
		.style.bindVariable('tabinator-direction', tabinatorDirection)
		.extend<TabinatorExtensions>(tabinator => ({
			Tab,
			watchNavigation () {
				navigate.state.delay(tabinator, 10).use(tabinator, () => {
					for (const tab of header.getChildren(Tab))
						if (tab.is(Link) && tab.href.value === new URL(navigate.state.value).pathname) {
							selectTab(tab)
							break
						}
				})
				return tabinator
			},
		}))

	function selectTab (newSelectedTab: Tab) {
		let previousSelectedTabIndex = Infinity
		let newSelectedTabIndex = -1
		const tabs = [...header.getChildren(Tab)]
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i]
			if (tab === newSelectedTab) {
				newSelectedTabIndex = i
				continue
			}

			if (tab.selected.value)
				previousSelectedTabIndex = Math.min(previousSelectedTabIndex, i)

			tab.selected.value = false
		}

		tabinatorDirection.value = (Math.sign(newSelectedTabIndex - previousSelectedTabIndex) || -1) as -1 | 1
		newSelectedTab.selected.value = true
	}
})

export default Tabinator

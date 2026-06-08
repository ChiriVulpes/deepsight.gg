import Button from 'component/core/Button'
import Filter from 'component/display/Filter'
import { Component, State } from 'kitsui'
import type TextManipulator from 'kitsui/utility/TextManipulator'

interface DisplayBarButtonExtensions {
	readonly title: Component
	readonly titleText: TextManipulator<this>
	readonly subtitle: Component
	readonly subtitleText: TextManipulator<this>
}

interface DisplayBarButton extends Button, DisplayBarButtonExtensions { }

const DisplayBarButton = Component((component, icon: string): DisplayBarButton => {
	const button = component.and(Button)
		.style.remove('button')
		.tweak(button => button.textWrapper.remove())
		.style('display-bar-button')
		.style.bind(component.hoveredOrHasFocused, 'display-bar-button--hover')
		.style.bind(component.active, 'display-bar-button--active')
		.style.setVariable('display-bar-button-icon', `url(${icon})`)

	Component()
		.style('display-bar-button-icon')
		.style.bind(component.hoveredOrHasFocused, 'display-bar-button-icon--hover')
		.style.bind(component.active, 'display-bar-button-icon--active')
		.append(Component()
			.style('display-bar-button-icon-glyph')
			.append(Component()
				.style('display-bar-button-icon-spark', 'display-bar-button-icon-spark-1')
				.style.bind(component.hoveredOrHasFocused, 'display-bar-button-icon-spark--hover')
				.style.bind(component.active, 'display-bar-button-icon-spark--active'))
			.append(Component()
				.style('display-bar-button-icon-spark', 'display-bar-button-icon-spark-2')
				.style.bind(component.hoveredOrHasFocused, 'display-bar-button-icon-spark--hover')
				.style.bind(component.active, 'display-bar-button-icon-spark--active')))
		.appendTo(button)

	const title = Component()
		.style('display-bar-button-title')
		.appendTo(button)

	const subtitle = Component()
		.style('display-bar-button-subtitle')
		.appendTo(button)

	return button.extend<DisplayBarButtonExtensions>(button => ({
		title,
		titleText: title.text.rehost(button),
		subtitle,
		subtitleText: subtitle.text.rehost(button),
	}))
})

export interface DisplayHandlers {
	readonly filter: Filter
}

interface DisplayBarExtensions {
	readonly config: State.Mutable<DisplayBar.Config | undefined>
	readonly handlers: DisplayHandlers
}

interface DisplayBar extends Component, DisplayBarExtensions { }

namespace DisplayBar {
	export interface Config {
		readonly id: string
		readonly sortConfig?: object
		readonly filterConfig?: Filter.Config
	}
}

const DisplayBar = Object.assign(
	Component((component): DisplayBar => {
		component.style('display-bar')

		const config = State<DisplayBar.Config | undefined>(undefined)

		const noSort = config.mapManual(config => !config?.sortConfig)
		DisplayBarButton('/static/svg/sort.svg')
			.style('display-bar-sort-button')
			.style.bind(noSort, 'display-bar-button--disabled')
			.attributes.bind(noSort, 'inert')
			.titleText.set(quilt => quilt['display-bar/sort/title']())
			.appendTo(component)

		const filter = Filter()
		filter.config.bind(filter, config.map(filter, config => ({
			id: 'display-bar-default-filter',
			filters: [],
			...config?.filterConfig,
		})))

		DisplayBarButton('/static/svg/filter.svg')
			.style('display-bar-filter-button')
			.titleText.set(quilt => quilt['display-bar/filter/title']())
			.tweak(button => {
				button.title
					.style('display-bar-filter-button-title')
					.style.bind(filter.filterText.truthy, 'display-bar-filter-button-title--has-filter')
					.style.bind(button.hasFocused, 'display-bar-filter-button-title--has-focus')
				button.subtitle
					.style('display-bar-filter-button-subtitle')
					.append(filter)
			})
			.appendTo(component)

		DisplayBarButton('/static/svg/help.svg')
			.style('display-bar-help-button')
			.titleText.set(quilt => quilt['display-bar/help/title']())
			.subtitleText.set(quilt => quilt['display-bar/help/subtitle']())
			.appendTo(component)

		return component
			.extend<DisplayBarExtensions>(displayBar => ({
				config,
				handlers: {
					filter,
				},
			}))
			.appendToWhen(config.truthy, Component.getBody())
	}),
	{
		Config (config: DisplayBar.Config): DisplayBar.Config {
			return config
		},
	}
)

export default DisplayBar

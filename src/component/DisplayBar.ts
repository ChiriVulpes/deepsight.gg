import Button from 'component/core/Button'
import Filter from 'component/display/Filter'
import FilterElement from 'component/display/filter/FilterElement'
import { Component, State } from 'kitsui'
import type TextManipulator from 'kitsui/utility/TextManipulator'

interface DisplayBarButtonExtensions {
	readonly title: Component
	readonly titleText: TextManipulator<this>
	readonly subtitle: Component
	readonly subtitleText: TextManipulator<this>
}

interface DisplayBarButton extends Button, DisplayBarButtonExtensions { }

const DisplayBarButton = Component((component): DisplayBarButton => {
	const button = component.and(Button)
		.style.remove('button')
		.tweak(button => button.textWrapper.remove())
		.style('display-bar-button')
		.style.bind(component.hoveredOrHasFocused, 'display-bar-button--hover')
		.style.bind(component.active, 'display-bar-button--active')

	Component()
		.style('display-bar-button-icon')
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
		readonly sortConfig?: {}
		readonly filterConfig?: {}
	}
}

const DisplayBar = Object.assign(
	Component((component): DisplayBar => {
		component.style('display-bar')

		DisplayBarButton()
			.style('display-bar-sort-button')
			.titleText.set(quilt => quilt['display-bar/sort/title']())
			.appendTo(component)

		const filter = Filter()
		filter.config.value = {
			id: 'display-bar-filter',
			filters: [FilterElement],
		}
		DisplayBarButton()
			.style('display-bar-filter-button')
			.titleText.set(quilt => quilt['display-bar/filter/title']())
			.tweak(button => {
				button.title
					.style('display-bar-filter-button-title')
					.style.bind(filter.filterText.truthy, 'display-bar-filter-button-title--has-filter')
					.style.bind(button.hasFocused, 'display-bar-filter-button-title--has-focus')
				button.subtitle.append(filter)
			})
			.appendTo(component)

		DisplayBarButton()
			.style('display-bar-help-button')
			.titleText.set(quilt => quilt['display-bar/help/title']())
			.subtitleText.set(quilt => quilt['display-bar/help/subtitle']())
			.appendTo(component)

		const config = State<DisplayBar.Config | undefined>(undefined)
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

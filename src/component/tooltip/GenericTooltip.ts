import { Component } from 'kitsui'
import Tooltip from 'kitsui/component/Tooltip'
import type TextManipulator from 'kitsui/utility/TextManipulator'

interface GenericTooltipExtensions {
	readonly title: Component
	readonly titleText: TextManipulator<this>
	readonly description: Component
	readonly descriptionText: TextManipulator<this>
}

interface GenericTooltip extends Component, GenericTooltipExtensions { }

const GenericTooltip = Component((component): GenericTooltip => {
	const tooltip = component.style('generic-tooltip').as(Tooltip)!.anchor.reset()

	tooltip.header.style('generic-tooltip-header')
	const title = Component()
		.style('generic-tooltip-title')
		.appendTo(tooltip.header)
	tooltip.body.style('generic-tooltip-body')
	const description = Component()
		.style('generic-tooltip-description')
		.appendTo(tooltip.body)
	return component.extend<GenericTooltipExtensions>(tooltip => ({
		title,
		titleText: title.text.rehost(tooltip),
		description,
		descriptionText: description.text.rehost(tooltip),
	}))
})

export default GenericTooltip

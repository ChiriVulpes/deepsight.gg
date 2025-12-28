import { Component, State } from 'kitsui'
import Tooltip from 'kitsui/component/Tooltip'
import type TextManipulator from 'kitsui/utility/TextManipulator'
import TooltipManager from 'utility/TooltipManager'

interface GenericTooltipExtensions {
	readonly title: Component
	readonly titleText: TextManipulator<this>
	readonly description: Component
	readonly descriptionText: TextManipulator<this>
}

interface GenericTooltip extends Tooltip, GenericTooltipExtensions { }

const GenericTooltipBuilder = Component((component): GenericTooltip => {
	const tooltip = component.style('generic-tooltip').as(Tooltip)!
		.anchor.reset()
		.anchor.add('off right', 'sticky centre')
		.anchor.add('off left', 'sticky centre')

	tooltip.header.style('generic-tooltip-header')

	const title = Component()
		.style('generic-tooltip-title')
		.appendTo(tooltip.header)

	tooltip.body.style('generic-tooltip-body')

	const description = Component()
		.style('generic-tooltip-description')
		.appendTo(tooltip.body)

	return tooltip.extend<GenericTooltipExtensions>(tooltip => ({
		title,
		titleText: title.text.rehost(tooltip),
		description,
		descriptionText: description.text.rehost(tooltip),
	}))
})

type GenericTooltipApplicator = (tooltip: GenericTooltip) => unknown
const GenericTooltip = TooltipManager(GenericTooltipBuilder, {
	states: {
		applicator: undefined as State.Mutable<GenericTooltipApplicator> | undefined,
	},
	update (states, applicator: GenericTooltipApplicator) {
		states.updateApplicator(applicator)
	},
	build (states, tooltip, applicator: GenericTooltipApplicator) {
		return tooltip.and(GenericTooltipBuilder).tweak(tooltip => {
			states.applicator ??= State(applicator)
			states.applicator.use(tooltip, tooltip.tweak)
		})
	},
})

export default GenericTooltip

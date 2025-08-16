import Stats from 'component/Stats'
import type Collections from 'conduit.deepsight.gg/Collections'
import type { ItemPlug } from 'conduit.deepsight.gg/Collections'
import { Component, State } from 'kitsui'
import Tooltip from 'kitsui/component/Tooltip'

export default Component((component, plug: State.Or<ItemPlug>, collections: State.Or<Collections>) => {
	plug = State.get(plug)
	collections = State.get(collections)

	const tooltip = component.as(Tooltip)!
		.anchor.reset()
		.anchor.add('off right', 'sticky centre')
		.anchor.add('off left', 'sticky centre')

	////////////////////////////////////
	//#region Header

	tooltip.header.style('item-tooltip-header', 'plug-tooltip-header')

	Component()
		.style('item-tooltip-title')
		.text.bind(plug.map(tooltip, plug => plug.displayProperties.name))
		.appendTo(tooltip.header)

	Component()
		.style('item-tooltip-subtitle')
		.append(Component()
			.style('item-tooltip-subtitle-type')
			.text.bind(plug.map(tooltip, plug => plug.type))
		)
		// .append(Component()
		// 	.style('item-tooltip-subtitle-rarity')
		// 	.text.bind(rarity.map(tooltip, rarity => rarity.displayProperties.name))
		// )
		.appendTo(tooltip.header)

	//#endregion
	////////////////////////////////////

	tooltip.body.style('item-tooltip-body')

	Component()
		.style('plug-tooltip-description')
		.text.bind(plug.map(tooltip, plug => plug.displayProperties.description))
		.appendTo(tooltip.body)

	Component()
		.style('item-tooltip-stats')
		.and(Stats, plug, collections)
		.tweak(stats => {
			stats.style.bind(stats.anyVisible.falsy, 'item-tooltip-stats--no-visible-stats')
			stats.appendToWhen(stats.hasStats, tooltip.body)
		})

	return tooltip
})

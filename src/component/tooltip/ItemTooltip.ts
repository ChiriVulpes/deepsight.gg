import type Collections from 'conduit.deepsight.gg/Collections'
import type { CollectionsItem } from 'conduit.deepsight.gg/Collections'
import { Component, State } from 'kitsui'
import Tooltip from 'kitsui/component/Tooltip'

export default Component((component, item: State.Or<CollectionsItem>, collections: State.Or<Collections>) => {
	item = State.get(item)
	collections = State.get(collections)

	const rarity = item.map(component, item => collections.value.rarities[item.rarity])
	const featured = item.map(component, item => !!item.featuredWatermark)
	const tier = item.map(component, item => item.tier)

	const tooltip = component.as(Tooltip)!
		.anchor.reset()
		.anchor.add('off right', 'sticky centre')
		.anchor.add('off left', 'sticky centre')
		.style.bindFrom(rarity.map(component, rarity => `item-tooltip--${rarity.displayProperties.name!.toLowerCase()}` as 'item-tooltip--common'))

	tooltip.header.style('item-tooltip-header')

	Component()
		.style('item-tooltip-title')
		.text.bind(item.map(component, item => item.displayProperties.name))
		.appendTo(tooltip.header)

	Component()
		.style('item-tooltip-subtitle')
		.append(Component()
			.style('item-tooltip-subtitle-type')
			.text.bind(item.map(component, item => item.type))
		)
		.append(Component()
			.style('item-tooltip-subtitle-rarity')
			.text.bind(rarity.map(component, rarity => rarity.displayProperties.name))
		)
		.appendTo(tooltip.header)

	Component()
		.style('item-tooltip-watermark')
		.style.bind(featured, 'item-tooltip-watermark--featured')
		.style.bindVariable('item-watermark', item.map(component, item => `url(https://www.bungie.net${item.watermark})`))
		.appendTo(tooltip.header)

	Component()
		.style('item-tooltip-watermark-tier')
		.style.bindFrom(tier.map(component, tier => `item-tooltip-watermark-tier--${tier}` as 'item-tooltip-watermark-tier--4'))
		.tweak(wrapper => {
			tier.use(wrapper, (tier = 0) => {
				wrapper.removeContents()
				for (let i = 0; i < tier; i++)
					Component()
						.style('item-tooltip-watermark-tier-dot')
						.appendTo(wrapper)
			})
		})
		.appendTo(tooltip.header)

	return tooltip
})

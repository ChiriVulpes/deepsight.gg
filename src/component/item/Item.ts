import Button from 'component/core/Button'
import Image from 'component/core/Image'
import ItemTooltip from 'component/tooltip/ItemTooltip'
import type Collections from 'conduit.deepsight.gg/Collections'
import type { Item as CollectionsItem } from 'conduit.deepsight.gg/Collections'
import { Component, State } from 'kitsui'
import type Tooltip from 'kitsui/component/Tooltip'

interface ItemExtensions {
	readonly item: State<CollectionsItem>
}

interface Item extends Component, ItemExtensions { }

const Item = Object.assign(
	Component((component, item: State.Or<CollectionsItem>, collections: State.Or<Collections>): Item => {
		item = State.get(item)
		collections = State.get(collections)

		const masterworked = item.map(component, item => false)
		const featured = item.map(component, item => !!item.featuredWatermark)
		const rarity = item.map(component, item => collections.value.rarities[item.rarity])

		component.and(Button)
		component.style('item')
		component.style.bindFrom(rarity.map(component, rarity => `item--${rarity.displayProperties.name!.toLowerCase()}` as 'item--common'))
		component.style.bind(masterworked, 'item--masterworked')

		Component()
			.style('item-border')
			.style.bind(masterworked, 'item-border--masterworked')
			.appendTo(component)

		Component()
			.style('item-image-background')
			.append(Image(item.map(component, item => `https://www.bungie.net${item.displayProperties.icon}`))
				.style('item-image')
			)
			.appendTo(component)

		Component()
			.style('item-watermark')
			.style.bind(featured, 'item-watermark--featured')
			.style.bindVariable('item-watermark', item.map(component, item => `url(https://www.bungie.net${item.watermark})`))
			.appendTo(component)

		Component()
			.style('item-border-glow')
			.style.bind(masterworked, 'item-border-glow--masterworked')
			.appendTo(component)

		ItemTooltip.apply(component, item, collections)

		component.event.subscribe('contextmenu', event => {
			event.preventDefault()
			if (!item.value.instanceId)
				void navigate.toURL(`/collections/${item.value.refNames.moment}/${item.value.refNames.item}`)
			else
				throw new Error('Cannot navigate to an item instance view yet')
		})
		return component.extend<ItemExtensions>(itemComponent => ({
			item,
		}))
	}),
	{
		Tooltip: undefined as Tooltip | undefined,
	},
)

export default Item

import Button from 'component/core/Button'
import Image from 'component/core/Image'
import ItemTooltip from 'component/tooltip/ItemTooltip'
import type Collections from 'conduit.deepsight.gg/Collections'
import type { Item as CollectionsItem, CollectionsMoment } from 'conduit.deepsight.gg/Collections'
import { Component, State } from 'kitsui'
import type Tooltip from 'kitsui/component/Tooltip'
import DisplayProperties from 'model/DisplayProperties'

interface ItemExtensions {
	readonly item: State<CollectionsItem>
}

interface Item extends Component, ItemExtensions { }

const Item = Object.assign(
	Component((component, item: State.Or<CollectionsItem>, collections: State.Or<Collections>): Item => {
		item = State.get(item)
		collections = State.get(collections)

		const masterworked = item.map(component, item => false)
		const featured = item.map(component, item => item.featured)
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

		const moment = State.Map(component, [collections, item], (collections, item): CollectionsMoment | undefined => collections.moments.find(moment => moment.moment.hash === item.momentHash))
		Component()
			.style('item-watermark')
			.style.bind(featured, 'item-watermark--featured')
			.style.bindVariable('item-watermark', moment.map(component, moment => moment && `url(${DisplayProperties.icon(moment.moment.iconWatermark)}`))
			.appendTo(component)

		Component()
			.style('item-border-glow')
			.style.bind(masterworked, 'item-border-glow--masterworked')
			.appendTo(component)

		ItemTooltip.apply(component, item, collections)

		component.onRooted(() => component.event.subscribe('contextmenu', event => {
			event.preventDefault()
			if (!item.value.instanceId)
				void navigate.toURL(`/collections/${item.value.refNames.moment}/${item.value.refNames.item}`)
			else
				throw new Error('Cannot navigate to an item instance view yet')
		}))
		return component.extend<ItemExtensions>(itemComponent => ({
			item,
		}))
	}),
	{
		Tooltip: undefined as Tooltip | undefined,
	},
)

export default Item

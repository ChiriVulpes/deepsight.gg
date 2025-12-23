import Button from 'component/core/Button'
import Image from 'component/core/Image'
import ItemTooltip from 'component/tooltip/ItemTooltip'
import type { CollectionsMoment } from 'conduit.deepsight.gg/item/Collections'
import { Component, State } from 'kitsui'
import type Tooltip from 'kitsui/component/Tooltip'
import DisplayProperties from 'model/DisplayProperties'
import type { ItemState } from 'model/Item'
import type { DeepsightTierTypeDefinition } from 'node_modules/deepsight.gg/Interfaces'

interface ItemExtensions {
	readonly state: State<ItemState>
}

interface Item extends Component, ItemExtensions { }

const Item = Object.assign(
	Component((component, state: State.Or<ItemState>): Item => {
		state = State.get(state)

		const masterworked = state.map(component, item => false)
		const featured = state.map(component, item => item.definition.featured)
		const rarity = state.map(component, ({ collections, definition }): DeepsightTierTypeDefinition | undefined => collections.rarities[definition.rarity])

		component.and(Button)
		component.style('item')
		component.style.bindFrom(rarity.map(component, rarity => rarity && `item--${rarity.displayProperties.name!.toLowerCase()}` as 'item--common'))
		component.style.bind(masterworked, 'item--masterworked')

		Component()
			.style('item-border')
			.style.bind(masterworked, 'item-border--masterworked')
			.appendTo(component)

		Component()
			.style('item-image-background')
			.append(Image(state.map(component, ({ definition }) => `https://www.bungie.net${definition.displayProperties.icon}`))
				.style('item-image')
			)
			.appendTo(component)

		const moment = state.map(component, ({ collections, definition }): CollectionsMoment | undefined => collections.moments.find(moment => moment.moment.hash === definition.momentHash))
		Component()
			.style('item-watermark')
			.style.bind(featured, 'item-watermark--featured')
			.style.bindVariable('item-watermark', moment.map(component, moment => moment && `url(${DisplayProperties.icon(moment.moment.iconWatermark)}`))
			.appendTo(component)

		Component()
			.style('item-border-glow')
			.style.bind(masterworked, 'item-border-glow--masterworked')
			.appendTo(component)

		ItemTooltip.apply(component, state)

		component.onRooted(() => component.event.subscribe('contextmenu', event => {
			event.preventDefault()
			if (!state.value.instance?.id)
				void navigate.toURL(`/collections/${state.value.definition.refNames.moment}/${state.value.definition.refNames.item}`)
			else
				throw new Error('Cannot navigate to an item instance view yet')
		}))
		return component.extend<ItemExtensions>(itemComponent => ({
			state,
		}))
	}),
	{
		Tooltip: undefined as Tooltip | undefined,
	},
)

export default Item

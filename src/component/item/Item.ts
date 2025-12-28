import Button from 'component/core/Button'
import Image from 'component/core/Image'
import ItemTooltip from 'component/tooltip/ItemTooltip'
import { Component, State } from 'kitsui'
import type Tooltip from 'kitsui/component/Tooltip'
import DisplayProperties from 'model/DisplayProperties'
import type { ItemState } from 'model/Item'
import Moment from 'model/Moment'
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
		const rarity = state.map(component, ({ provider: collections, definition }): DeepsightTierTypeDefinition | undefined => collections.rarities[definition.rarity])

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

		const moment = Moment.fromItemState(component, state)
		const momentIcon = moment.map(component, moment => moment && `url(${DisplayProperties.icon(moment.iconWatermark)}`)
		Component()
			.style('item-watermark')
			.style.bind(featured, 'item-watermark--featured')
			.style.bindVariable('item-watermark', momentIcon)
			.appendToWhen(momentIcon.truthy, component)

		Component()
			.style('item-border-glow')
			.style.bind(masterworked, 'item-border-glow--masterworked')
			.appendTo(component)

		const quantity = state.map(component, item => (item.instance?.quantity ?? 0) > 1 ? item.instance!.quantity : undefined)
		const quantityCapped = state.map(component, item => (item.instance?.quantity ?? 0) >= (item.definition.maxStackSize ?? 0))
		Component()
			.style('item-quantity')
			.style.bind(quantityCapped, 'item-quantity--capped')
			.append(Component()
				.style('item-quantity-text')
				.text.bind(quantity.stringified)
			)
			.appendToWhen(quantity.truthy, component)

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

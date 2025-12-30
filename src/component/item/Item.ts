import Button from 'component/core/Button'
import Image from 'component/core/Image'
import ItemTooltip from 'component/tooltip/ItemTooltip'
import { ItemCategoryHashes } from 'deepsight.gg/Enums'
import type { DeepsightTierTypeDefinition } from 'deepsight.gg/Interfaces'
import { Component, State } from 'kitsui'
import type Tooltip from 'kitsui/component/Tooltip'
import DisplayProperties from 'model/DisplayProperties'
import type { ItemState } from 'model/Items'
import Moment from 'model/Moment'
import { ItemState as InventoryItemState } from 'node_modules/bungie-api-ts/destiny2'
import Categorisation from 'utility/Categorisation'
import { _ } from 'utility/Objects'

interface ItemExtensions {
	readonly state: State<ItemState>
}

interface Item extends Component, ItemExtensions { }

const Item = Object.assign(
	Component((component, state: State.Or<ItemState>): Item => {
		state = State.get(state)

		const masterworked = state.map(component, item => !!((item.instance?.state ?? InventoryItemState.None) & InventoryItemState.Masterwork))
		const featured = state.map(component, item => item.definition.featured)
		const isEngram = state.map(component, item => !!item.definition.categoryHashes?.includes(ItemCategoryHashes.Engrams))
		const rarity = state.map(component, ({ provider: collections, definition }): DeepsightTierTypeDefinition | undefined => collections.rarities[definition.rarity])

		component.and(Button)
		component.style('item')
		component.style.bindFrom(rarity.map(component, rarity => rarity && `item--${rarity.displayProperties.name!.toLowerCase()}` as 'item--common'))
		component.style.bind(masterworked, 'item--masterworked')
		component.style.bind(isEngram, 'item--engram')

		Component()
			.style('item-border')
			.style.bind(masterworked, 'item-border--masterworked')
			.appendTo(component)

		const background = state.map(component, item => {
			const ornamentSocket = item.definition.sockets.findIndex(Categorisation.IsOrnament)
			const displayItem = _
				?? item.provider.items[item.instance?.sockets?.[ornamentSocket]?.plugHash!]
				?? item.definition
			return DisplayProperties.icon(displayItem.displayProperties.icon)
		})
		Component()
			.style('item-image-background')
			.append(Image(background).style('item-image'))
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

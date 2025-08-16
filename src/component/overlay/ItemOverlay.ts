import Image from 'component/core/Image'
import Lore from 'component/core/Lore'
import Item from 'component/Item'
import GenericTooltip from 'component/tooltip/GenericTooltip'
import PlugTooltip from 'component/tooltip/PlugTooltip'
import type Collections from 'conduit.deepsight.gg/Collections'
import type { Item as CollectionsItem, ItemPlug, ItemSocket } from 'conduit.deepsight.gg/Collections'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import InputBus from 'kitsui/utility/InputBus'
import type TextManipulator from 'kitsui/utility/TextManipulator'
import { SocketCategoryHashes } from 'node_modules/deepsight.gg/Enums'
import Relic from 'Relic'
import Categorisation from 'utility/Categorisation'

const DestinySocketCategoryDefinition = State.Async(async () => {
	const conduit = await Relic.connected
	return await conduit.definitions.en.DestinySocketCategoryDefinition.all()
})

export default Component((component, item: State.Or<CollectionsItem | undefined>, collections: State.Or<Collections>) => {
	item = State.get(item)
	collections = State.get(collections)

	const overlay = component.style('item-overlay')

	Image(item.map(overlay, item => item?.previewImage && `https://www.bungie.net${item.previewImage}`))
		.style('item-overlay-image')
		.appendTo(overlay)

	Component()
		.style('item-overlay-header')
		.append(Slot().use(item, (_, item) => item
			&& Item(item, collections).style('item-overlay-icon')
		))
		.append(Component().style('item-overlay-title').text.bind(item.map(overlay, item => item?.displayProperties.name)))
		.append(Component().style('item-overlay-subtitle').text.bind(item.map(overlay, item => item?.type)))
		.appendTo(overlay)

	const flavourText = item.map(overlay, item => item?.flavorText)
	Lore()
		.style('item-overlay-lore')
		.text.bind(flavourText)
		.appendToWhen(flavourText.truthy, overlay)

	interface SocketGroupExtensions {
		readonly header: Component
		readonly title: Component
		readonly content: Component
		readonly titleText: TextManipulator<this>
	}
	interface SocketGroup extends Component, SocketGroupExtensions { }
	const SocketGroup = Component((component, socket: SocketCategoryHashes): SocketGroup => {
		component.style.bind(component.hoveredOrHasFocused, 'item-overlay-socket-group--hover')

		const header = Component()
			.style('item-overlay-socket-group-header')
			.appendTo(component)
		header.style.bind(component.hoveredOrHasFocused, 'item-overlay-socket-group-header--hover')
		header.setTooltip(tooltip => tooltip.and(GenericTooltip)
			.titleText.bind(DestinySocketCategoryDefinition.map(component, defs => defs?.[socket].displayProperties.name))
			.descriptionText.bind(DestinySocketCategoryDefinition.map(component, defs => defs?.[socket].displayProperties.description))
		)

		const title = Component()
			.style('item-overlay-socket-group-title')
			.text.bind(DestinySocketCategoryDefinition.map(component, defs => defs?.[socket].displayProperties.name))
			.appendTo(header)

		const content = Component()
			.style('item-overlay-socket-group-content')
			.style.bind(component.hoveredOrHasFocused, 'item-overlay-socket-group-content--hover')
			.appendTo(component)

		return component.style('item-overlay-socket-group').extend<SocketGroupExtensions>(group => ({
			header, title, content,
			titleText: title.text.rehost(group),
		}))
	})

	const Plug = Component('button', (component, plug: ItemPlug) => {
		const isPerk = Categorisation.IsPerk(plug)
		component.style('item-overlay-plug')
			.style.toggle(isPerk, 'item-overlay-plug--perk')
			.style.bind(component.hoveredOrHasFocused, 'item-overlay-plug--hover')

		Component()
			.style('item-overlay-plug-effect')
			.style.toggle(isPerk, 'item-overlay-plug-effect--perk')
			.style.bind(component.hoveredOrHasFocused.map(component, hover => hover && isPerk), 'item-overlay-plug-effect--perk--hover')
			.appendTo(component)

		Image(`https://www.bungie.net${plug.displayProperties.icon}`)
			.style('item-overlay-plug-icon')
			.appendTo(component)

		component.setTooltip(tooltip => tooltip.and(PlugTooltip, plug, collections))
		return component
	})
	const Socket = Component((component, socket: ItemSocket, collections: Collections) => {
		component.style('item-overlay-socket')
		for (const hash of socket.plugs) {
			const plug = collections.plugs[hash]
			if (Categorisation.IsEnhanced(plug))
				continue

			Plug(plug).appendTo(component)
		}
		return component
	})

	const group = SocketGroup(SocketCategoryHashes.WeaponPerks_CategoryStyle1)
		.appendTo(overlay)

	Slot().appendTo(group.content).use(State.Use(group, { item, collections }), (slot, { item, collections }) => {
		const sockets = item?.sockets.filter(Categorisation.IsPerk) ?? []
		if (!item?.instanceId)
			for (let i = 0; i < sockets.length; i++) {
				if (i)
					Component().style('item-overlay-socket-group-gap').appendTo(slot)

				Socket(sockets[i], collections)
					.appendTo(slot)
			}
	})

	InputBus.event.until(component, event => event.subscribe('Down', (_, event) => {
		if (event.use('Escape')) {
			if (!item.value?.instanceId)
				void navigate.toURL('/collections')
			else
				throw new Error('Cannot navigate out of an item instance view yet')
		}
	}))

	return overlay
})

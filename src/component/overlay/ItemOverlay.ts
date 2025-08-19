import Image from 'component/core/Image'
import Lore from 'component/core/Lore'
import Item from 'component/item/Item'
import Power from 'component/item/Power'
import Stats from 'component/item/Stats'
import GenericTooltip from 'component/tooltip/GenericTooltip'
import PlugTooltip from 'component/tooltip/PlugTooltip'
import type Collections from 'conduit.deepsight.gg/Collections'
import type { Item as CollectionsItem, ItemAmmo, ItemPlug, ItemSocket } from 'conduit.deepsight.gg/Collections'
import { SocketCategoryHashes, StatHashes } from 'deepsight.gg/Enums'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import InputBus from 'kitsui/utility/InputBus'
import type TextManipulator from 'kitsui/utility/TextManipulator'
import Relic from 'Relic'
import Categorisation from 'utility/Categorisation'

const DestinySocketCategoryDefinition = State.Async(async () => {
	const conduit = await Relic.connected
	return await conduit.definitions.en.DestinySocketCategoryDefinition.all()
})

const PowerStatDefinition = State.Async(async () => {
	const conduit = await Relic.connected
	return await conduit.definitions.en.DestinyStatDefinition.get(StatHashes.Power)
})

export default Component((component, intendedItem: State.Or<CollectionsItem | undefined>, collections: State.Or<Collections>) => {
	// preserve all the ui for the last item when the "intended" item is set to undefined
	const item = State<CollectionsItem | undefined>(undefined)
	State.get(intendedItem).use(component, intendedItem => item.value = intendedItem ?? item.value)

	collections = State.get(collections)

	const overlay = component.style('item-overlay')

	const background = Component().style('item-overlay-background').appendTo(overlay)

	Image(item.map(overlay, item => item?.previewImage && `https://www.bungie.net${item.previewImage}`))
		.style('item-overlay-image')
		.appendTo(background)

	Image(item.map(overlay, item => item?.foundryImage && `https://www.bungie.net${item.foundryImage}`))
		.style('item-overlay-foundry')
		.appendTo(background)

	const mainColumn = Component()
		.style('item-overlay-column-content')
		.appendTo(Component()
			.style('item-overlay-column', 'item-overlay-column--main')
			.appendTo(overlay)
		)

	////////////////////////////////////
	//#region Display

	Component()
		.style('item-overlay-header')
		.append(Slot().use(item, (_, item) => item
			&& Item(item, collections).style('item-overlay-icon')
		))
		.append(Component().style('item-overlay-title').text.bind(item.map(overlay, item => item?.displayProperties.name)))
		.append(Component().style('item-overlay-subtitle').text.bind(item.map(overlay, item => item?.type)))
		.appendTo(mainColumn)

	const flavourText = item.map(overlay, item => item?.flavorText)
	Lore()
		.style('item-overlay-lore')
		.text.bind(flavourText)
		.appendToWhen(flavourText.truthy, mainColumn)

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Sockets

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

		PlugTooltip.apply(component, plug, collections)
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
		.appendTo(mainColumn)

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

	//#endregion
	////////////////////////////////////

	const sideColumn = Component()
		.style('item-overlay-column-content', 'item-overlay-column-content--side')
		.appendTo(Component()
			.style('item-overlay-column', 'item-overlay-column--side')
			.appendTo(overlay)
		)

	////////////////////////////////////
	//#region Stats

	// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
	const ammo = State.Map(overlay, [item, collections], (item, collections): ItemAmmo | undefined => collections.ammoTypes[item?.ammo!])
	const stats = Stats(item, collections, {
		tweakStatLabel: label => label.style('item-overlay-stats-stat-label'),
		tweakStatSection: section => section.style('item-overlay-stats-stat-section'),
	})
	Component()
		.style('item-overlay-stats-wrapper')
		.tweak(c => c.style.bind(c.hoveredOrHasFocused, 'item-overlay-stats-wrapper--hover'))
		.append(Component()
			.style('item-overlay-stats-primary')
			.append(Component()
				.style('item-overlay-stats-primary-power')
				.append(Component()
					.style('item-overlay-stats-primary-power-label')
					.text.bind(PowerStatDefinition.map(stats, def => def?.displayProperties.name))
				)
				.append(Power(State.Use(stats, { damageTypes: item.map(stats, item => item?.damageTypes) }), collections)
					.style('item-overlay-stats-primary-power-display')
				)
			)
			.appendWhen(ammo.truthy, Component()
				.style('item-overlay-stats-primary-ammo')
				.append(Image(ammo.mapManual(ammo => ammo && `https://www.bungie.net${ammo.displayProperties.icon}`))
					.style('item-overlay-stats-primary-ammo-icon')
				)
				.append(Component()
					.style('item-overlay-stats-primary-ammo-label')
					.text.bind(ammo.mapManual(ammo => ammo?.displayProperties.name))
				)
			)
		)
		.appendWhen(stats.hasStats, stats
			.style('item-overlay-stats')
		)
		.appendTo(sideColumn)

	//#endregion
	////////////////////////////////////

	InputBus.event.until(overlay, event => event.subscribe('Down', (_, event) => {
		if (event.use('Escape')) {
			if (!item?.value?.instanceId)
				void navigate.toURL('/collections')
			else
				throw new Error('Cannot navigate out of an item instance view yet')
		}
	}))

	return overlay
})

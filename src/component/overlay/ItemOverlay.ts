import type { DestinyDisplayPropertiesDefinition } from 'bungie-api-ts/destiny2'
import Image from 'component/core/Image'
import Lore from 'component/core/Lore'
import Item from 'component/item/Item'
import Power, { PowerState } from 'component/item/Power'
import Stats, { StatsState } from 'component/item/Stats'
import GenericTooltip from 'component/tooltip/GenericTooltip'
import PlugTooltip, { PlugState } from 'component/tooltip/PlugTooltip'
import type { ItemAmmo, ItemPlug, ItemProvider, ItemSocketDefinition } from 'conduit.deepsight.gg/item/Item'
import type { DeepsightPlugFullName } from 'deepsight.gg/DeepsightPlugCategorisation'
import { ItemCategoryHashes, SocketCategoryHashes, StatHashes } from 'deepsight.gg/Enums'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import InputBus from 'kitsui/utility/InputBus'
import type TextManipulator from 'kitsui/utility/TextManipulator'
import ArmourSet from 'model/ArmourSet'
import DisplayProperties from 'model/DisplayProperties'
import type { ItemState, ItemStateOptional } from 'model/Items'
import Relic from 'Relic'
import Categorisation from 'utility/Categorisation'

const PowerStatDefinition = State.Async(async () => {
	const conduit = await Relic.connected
	return await conduit.definitions.en.DestinyStatDefinition.get(StatHashes.Power)
})

export default Component((component, intendedState: State<ItemStateOptional>) => {
	// preserve all the ui for the last item when the "intended" item is set to undefined
	const state = State<ItemStateOptional>({ provider: intendedState.value.provider })
	intendedState.use(component, intendedState => state.value = {
		...intendedState,
		definition: state.value.definition ?? intendedState?.definition,
	})

	const provider = intendedState.map(component, state => state.provider)

	const overlay = component.style('item-overlay')

	const background = Component().style('item-overlay-background').appendTo(overlay)

	Image(state.map(overlay, state => state?.definition?.previewImage && `https://www.bungie.net${state.definition.previewImage}`))
		.style('item-overlay-image')
		.appendTo(background)

	const foundryImage = state.map(overlay, state => DisplayProperties.icon(state?.provider?.foundries[state.definition?.foundryHash!]?.overlay))
	Image(foundryImage)
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
		.append(Slot().use(state, (_, state) => state?.definition
			&& Item(state as ItemState).style('item-overlay-icon')
		))
		.append(Component().style('item-overlay-title').text.bind(state.map(overlay, state => state?.definition?.displayProperties.name)))
		.append(Component().style('item-overlay-subtitle').text.bind(state.map(overlay, state => state?.definition?.type)))
		.appendTo(mainColumn)

	const flavourText = state.map(overlay, state => state?.definition?.flavorText)
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
	const SocketGroup = Component((component, socket: SocketCategoryHashes | State.Or<{ displayProperties: DestinyDisplayPropertiesDefinition }>): SocketGroup => {
		component.style.bind(component.hoveredOrHasFocused, 'item-overlay-socket-group--hover')

		const def = typeof socket !== 'number'
			? State.get(socket)
			: state.map(component, state => state?.provider?.socketCategories?.[socket])

		const header = Component()
			.style('item-overlay-socket-group-header')
			.style.bind(component.hoveredOrHasFocused, 'item-overlay-socket-group-header--hover')
			.tweak(GenericTooltip.apply, tooltip => tooltip
				.titleText.bind(def.map(component, def => def?.displayProperties.name))
				.descriptionText.bind(def.map(component, def => def?.displayProperties.description))
			)
			.appendTo(component)

		const title = Component()
			.style('item-overlay-socket-group-title')
			.text.bind(def.map(component, def => def?.displayProperties.name))
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

	const ArmorSetPlugType = 'Intrinsic/ArmorSet' as DeepsightPlugFullName
	const Plug = Component('button', (component, plug: ItemPlug) => {
		const isPerk = Categorisation.IsPerk(plug) || Categorisation.IsOrigin(plug)
		const isFrame = Categorisation.IsFrame(plug)
		const isArmorSet = plug.type === ArmorSetPlugType
		component.style('item-overlay-plug')
			.style.toggle(isPerk, 'item-overlay-plug--perk')
			.style.toggle(isFrame, 'item-overlay-plug--frame')
			.style.toggle(isArmorSet, 'item-overlay-plug--armorset')
			.style.bind(component.hoveredOrHasFocused, 'item-overlay-plug--hover')

		Component()
			.style('item-overlay-plug-effect')
			.style.toggle(isPerk, 'item-overlay-plug-effect--perk')
			.style.toggle(isFrame, 'item-overlay-plug-effect--frame')
			.style.toggle(isArmorSet, 'item-overlay-plug-effect--armorset')
			.style.bind(component.hoveredOrHasFocused.map(component, hover => hover && isPerk), 'item-overlay-plug-effect--perk--hover')
			.style.bind(component.hoveredOrHasFocused.map(component, hover => hover && isFrame), 'item-overlay-plug-effect--frame--hover')
			.appendTo(component)

		Image(`https://www.bungie.net${plug.displayProperties.icon}`)
			.style('item-overlay-plug-icon')
			.appendTo(component)

		PlugTooltip.apply(component, provider.map(component, provider => PlugState.resolve(plug, provider)))
		return component
	})
	const Socket = Component((component, socket: ItemSocketDefinition, provider: ItemProvider) => {
		component.style('item-overlay-socket')
		for (const hash of socket.plugs) {
			const plug = provider.plugs[hash]
			if (Categorisation.IsEnhanced(plug))
				continue

			Plug(plug).appendTo(component)
		}
		return component
	})

	////////////////////////////////////
	//#region Weapon Perks

	const isWeapon = state.map(component, state => !!state?.definition?.categoryHashes?.includes(ItemCategoryHashes.Weapon))
	SocketGroup(SocketCategoryHashes.WeaponPerks_CategoryStyle1)
		.tweak(group => Slot().appendTo(group.content).use(state, (slot, { definition, instance, provider: collections }) => {
			const sockets = definition?.sockets.filter(Categorisation.IsPerk) ?? []
			if (!instance?.id)
				for (let i = 0; i < sockets.length; i++) {
					if (i)
						Component().style('item-overlay-socket-group-gap').appendTo(slot)

					Socket(sockets[i], collections)
						.appendTo(slot)
				}
		}))
		.appendToWhen(isWeapon, mainColumn)

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Intrinsic Traits

	Slot().appendTo(mainColumn).use(state, (slot, state) => {
		const sockets = state?.definition?.sockets.filter(Categorisation.IsIntrinsic) ?? []
		if (!state || !sockets.length)
			return

		const provider = state.provider

		SocketGroup(SocketCategoryHashes.IntrinsicTraits)
			.tweak(group => {
				if (!state.instance?.id) {
					for (let i = 0; i < sockets.length; i++) {
						if (i)
							Component().style('item-overlay-socket-group-gap').appendTo(slot)

						const plug = provider.plugs[sockets[i].defaultPlugHash ?? sockets[i].plugs[0]]
						Socket(sockets[i], provider)
							.style('item-overlay-socket--intrinsic')
							.append(!Categorisation.IsFrame(sockets[i]) || !plug ? undefined : Component()
								.style('item-overlay-socket-display')
								.append(Component()
									.style('item-overlay-socket-display-name')
									.text.set(plug.displayProperties.name)
								)
								.append(Component()
									.style('item-overlay-socket-display-description')
									.text.set(plug.displayProperties.description)
								)
							)
							.appendTo(group.content)
					}
				}
			})
			.appendTo(slot)
	})

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Armour Set

	const itemSet = ArmourSet(component, state)
	Slot().appendTo(mainColumn).use(itemSet, (slot, itemSet) => {
		if (!itemSet)
			return

		return SocketGroup(itemSet.definition)
			.tweak(group => {
				for (let i = 0; i < itemSet.perks.length; i++) {
					if (i)
						Component().style('item-overlay-socket-group-gap').appendTo(group.content)

					const perk = itemSet.perks[i]
					Component()
						.style('item-overlay-socket', 'item-overlay-socket--intrinsic')
						.append(Plug({
							is: 'plug',
							hash: -1,
							type: ArmorSetPlugType,
							displayProperties: perk.definition.displayProperties,
							enhanced: false,
							categoryHash: undefined!,
						}))
						.append(Component()
							.style('item-overlay-socket-display')
							.append(Component()
								.style('item-overlay-socket-display-name')
								.text.set(perk.definition.displayProperties.name)
								.append(Component()
									.style('item-overlay-socket-armour-set-label-separator')
									.text.set('/')
								)
								.append(Component()
									.style('item-overlay-socket-armour-set-label-requirement')
									.text.set(quilt => quilt['item-tooltip/armour-set/perk-requirement'](perk.requiredSetCount, 5))
								)
							)
							.append(Component()
								.style('item-overlay-socket-display-description')
								.text.set(perk.definition.displayProperties.description)
							)
						)
						.appendTo(group.content)
				}
			})
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

	const ammo = state.map(overlay, ({ definition, provider: collections }): ItemAmmo | undefined => collections.ammoTypes[definition?.ammoType!])
	const stats = Stats(StatsState.fromItemState(state), {
		tweakStatLabel: (label, def) => (label
			.style('item-overlay-stats-stat-label')
			.tweak(GenericTooltip.apply, tooltip => tooltip
				.titleText.set(def.displayProperties.name)
				.descriptionText.set(def.displayProperties.description)
			)
		),
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
				.append(Power(PowerState.fromItemState(state))
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
			if (!state.value.instance?.id)
				void navigate.toURL('/collections')
			else
				throw new Error('Cannot navigate out of an item instance view yet')
		}
	}))

	return overlay
})

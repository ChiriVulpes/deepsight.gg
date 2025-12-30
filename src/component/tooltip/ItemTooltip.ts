import DisplaySlot from 'component/core/DisplaySlot'
import Image from 'component/core/Image'
import Lore from 'component/core/Lore'
import Paragraph from 'component/core/Paragraph'
import Power from 'component/item/Power'
import Stats, { StatsState } from 'component/item/Stats'
import type Inventory from 'conduit.deepsight.gg/item/Inventory'
import type { ItemAmmo, ItemPlug, ItemSource } from 'conduit.deepsight.gg/item/Item'
import type { DeepsightTierTypeDefinition } from 'deepsight.gg/Interfaces'
import { DeepsightItemSourceCategory } from 'deepsight.gg/Interfaces'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import Tooltip from 'kitsui/component/Tooltip'
import type { StringApplicatorSource } from 'kitsui/utility/StringApplicator'
import ArmourSet from 'model/ArmourSet'
import DisplayProperties from 'model/DisplayProperties'
import type { InventoryItemSocketTypes, ItemState } from 'model/Items'
import Items from 'model/Items'
import Moment from 'model/Moment'
import Categorisation from 'utility/Categorisation'
import { _ } from 'utility/Objects'
import TooltipManager from 'utility/TooltipManager'

const PLUG_ARCHETYPE_ICON_SEQUENCE = 0
const PLUG_ARCHETYPE_ICON_SEQUENCE_FRAME = 1

const ItemTooltip = Component((component, state: State<ItemState>) => {
	const tooltip = component.as(Tooltip)!
		.anchor.reset()
		.anchor.add('off right', 'sticky centre')
		.anchor.add('off left', 'sticky centre')

	const rarity = state.map(tooltip, ({ provider: collections, definition }): DeepsightTierTypeDefinition | undefined => collections.rarities[definition.rarity])
	const isCollections = state.map(tooltip, ({ instance }) => !instance?.id)

	tooltip.style.bindFrom(rarity.map(tooltip, rarity => rarity && `item-tooltip--${rarity.displayProperties.name!.toLowerCase()}` as 'item-tooltip--common'))

	////////////////////////////////////
	//#region Header

	tooltip.header.style('item-tooltip-header')

	Component()
		.style('item-tooltip-title')
		.text.bind(state.map(tooltip, ({ definition }) => definition.displayProperties.name))
		.appendTo(tooltip.header)

	Component()
		.style('item-tooltip-subtitle')
		.append(Component()
			.style('item-tooltip-subtitle-type')
			.text.bind(state.map(tooltip, ({ definition }) => definition.type))
		)
		.appendWhen(rarity.truthy, Component()
			.style('item-tooltip-subtitle-rarity')
			.text.bind(rarity.map(tooltip, rarity => rarity?.displayProperties.name))
		)
		.appendTo(tooltip.header)

	////////////////////////////////////
	//#region Watermark

	const moment = Moment.fromItemState(component, state)
	const momentIcon = moment.map(tooltip, moment => moment && `url(${DisplayProperties.icon(moment.iconWatermark)}`)
	const featured = state.map(tooltip, ({ definition }) => definition.featured)
	Component()
		.style('item-tooltip-watermark')
		.style.bind(featured, 'item-tooltip-watermark--featured')
		.style.bindVariable('item-watermark', momentIcon)
		.appendToWhen(momentIcon.truthy, tooltip.header)

	const tier = state.map(tooltip, ({ instance }) => instance?.tier)
	Component()
		.style('item-tooltip-watermark-tier')
		.style.bindFrom(tier.map(tooltip, tier => `item-tooltip-watermark-tier--${tier}` as 'item-tooltip-watermark-tier--4'))
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

	//#endregion
	////////////////////////////////////

	//#endregion
	////////////////////////////////////

	tooltip.body.style('item-tooltip-body')

	////////////////////////////////////
	//#region Primary Info

	const primaryInfo = Component()
		.style('item-tooltip-primary-info')
		.appendTo(tooltip.body)

	////////////////////////////////////
	//#region Damage

	Power(state.map(primaryInfo, ({ definition, provider }) => ({ damageTypes: definition.damageTypeHashes, provider })))
		.style('item-tooltip-damage')
		.appendTo(primaryInfo)

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Secondary Type

	const ammo = state.map(tooltip, ({ definition, provider: collections }): ItemAmmo | undefined => collections.ammoTypes[definition.ammoType!])
	const archetype = state.map(tooltip, ({ definition, provider: collections }): ItemPlug | undefined => {
		const socketPlugHash = definition.sockets.find(socket => socket.type === 'Intrinsic/ArmorArchetype')?.defaultPlugHash
		return collections.plugs[socketPlugHash!]
	})

	const secondaryType = State.Map(tooltip, [archetype, ammo], (archetype, ammo) => {
		if (ammo?.displayProperties)
			return ammo.displayProperties

		if (archetype?.displayProperties)
			return {
				...archetype.displayProperties,
				icon: archetype.displayProperties.iconSequences?.[PLUG_ARCHETYPE_ICON_SEQUENCE]?.frames?.[PLUG_ARCHETYPE_ICON_SEQUENCE_FRAME]
					?? archetype.displayProperties.icon,
			}
	})

	Component()
		.style('item-tooltip-type')
		.append(Component()
			.style('item-tooltip-type-icon')
			.style.bind(ammo.truthy, 'item-tooltip-type-icon--ammo')
			.style.bindVariable('item-tooltip-type-image', secondaryType.map(component, type => type && `url(https://www.bungie.net${type.icon})`))
		)
		.append(Component()
			.style('item-tooltip-type-label')
			.text.bind(secondaryType.map(component, type => type?.name))
		)
		.appendToWhen(secondaryType.truthy, primaryInfo)

	//#endregion
	////////////////////////////////////

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Stats

	Component()
		.style('item-tooltip-stats')
		.and(Stats, StatsState.fromItemState(state), { isAbbreviated: true })
		.tweak(stats => {
			stats.style.bind(stats.anyVisible.falsy, 'item-tooltip-stats--no-visible-stats')
			stats.appendToWhen(stats.hasStats, tooltip.body)
		})

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Perks

	const perks = state.map(tooltip, ({ definition, instance, characterId, provider }) => definition.sockets
		.map((socketDef, i): InventoryItemSocketTypes => instance?.sockets?.[i]
			? ({
				definition: socketDef,
				instance: instance.sockets[i],
				characterId: characterId!,
				provider: provider as Inventory,
			})
			: ({
				definition: socketDef,
				provider,
			})
		)
		.filter(socket => Categorisation.IsIntrinsicPerk(socket) || Categorisation.IsPerk(socket))
	)
	const itemSet = ArmourSet(tooltip, state)
	Component()
		.style('item-tooltip-perks')
		.tweak(wrapper => {
			Slot().appendTo(wrapper).use(
				State.Use(wrapper, { sockets: perks, itemSet, isCollections, state }),
				(slot, { sockets, itemSet, isCollections, state: { characterId, instance, provider } }) => {
					////////////////////////////////////
					//#region Socket component

					const Plugs = (socket: InventoryItemSocketTypes) => (Items.getPlugHashes(socket) ?? socket.definition.plugs.map(plugHash => ({ plugItemHash: plugHash })))
						.map(plug => provider.plugs[plug.plugItemHash])
						.filter(plug => !!plug)

					let index = 0
					const Socket = Component((wrapper, socket: InventoryItemSocketTypes, plugs?: ItemPlug[], noSocketed?: boolean) => {
						wrapper.style('item-tooltip-perks-perk')
							.style.setVariable('socket-index', index++)

						plugs ??= Plugs(socket)
						plugs = plugs
							.filter(plug => !!plug)
							.sort((a, b) => 0
								|| +!!b.displayProperties.name - +!!a.displayProperties.name
								|| +Categorisation.IsEnhanced(a) - +Categorisation.IsEnhanced(b)
							)

						const isCollectionsRoll = isCollections && plugs.length >= 4
						noSocketed = isCollectionsRoll ? noSocketed : false
						const socketed = noSocketed ? undefined : (_
							?? provider.plugs[socket.instance?.plugHash ?? socket.definition.defaultPlugHash!]
							?? (!isCollectionsRoll ? plugs.at(0) : undefined)
						)
						if (!socketed?.displayProperties.name && !isCollectionsRoll && !noSocketed)
							return

						if (socketed) {
							Image(`https://www.bungie.net${socketed.displayProperties.icon}`)
								.style('item-tooltip-perks-perk-icon')
								.appendTo(wrapper)

							Component()
								.style('item-tooltip-perks-perk-label')
								.text.set(socketed.displayProperties.name)
								.appendTo(wrapper)
						}

						const isSocketedEnhanced = Categorisation.IsEnhanced(socketed)
						wrapper.style.toggle(isSocketedEnhanced, 'item-tooltip-perks-perk--enhanced')
						const additionalPlugs = plugs.filter(plug => true
							&& plug.hash !== socketed?.hash
							&& (isSocketedEnhanced || !Categorisation.IsEnhanced(plug))
							&& !Categorisation.IsEmpty(plug)
						)
						for (const plug of additionalPlugs)
							Image(`https://www.bungie.net${plug.displayProperties.icon}`)
								.style('item-tooltip-perks-perk-icon')
								.appendTo(wrapper)

						return wrapper
					})

					//#endregion
					////////////////////////////////////

					////////////////////////////////////
					//#region Intrinsics
					// frame, origin, artifice, armour set perk (pre set bonuses, think iron banner perks)

					const intrinsics = sockets.filter(socket => Categorisation.IsIntrinsicPerk(socket))
					for (const socket of intrinsics)
						Socket(socket)
							?.style('item-tooltip-perks-perk--intrinsic')
							.appendTo(slot)

					//#endregion
					////////////////////////////////////

					////////////////////////////////////
					//#region Catalyst

					const exoticCatalyst = sockets.find(Categorisation.IsExoticCatalyst)
					if (exoticCatalyst && (isCollections || false)) {
						const realCatalystPlug = exoticCatalyst.definition.plugs.map(plugHash => provider.plugs[plugHash]).find(plug => plug.type === 'Masterwork/ExoticCatalyst')
						const perks = (realCatalystPlug?.perks ?? []).map(perkHash => provider.perks[perkHash]).filter(perk => !!perk)
						for (const perk of perks) {
							Component()
								.style('item-tooltip-perks-perk', 'item-tooltip-perks-perk--intrinsic')
								.append(Image(`https://www.bungie.net${perk.displayProperties.icon}`)
									.style('item-tooltip-perks-perk-icon')
								)
								.append(Component()
									.style('item-tooltip-perks-perk-label')
									.text.set(perk.displayProperties.name)
								)
								.appendTo(slot)
						}
					}

					//#endregion
					////////////////////////////////////

					////////////////////////////////////
					//#region Set Bonuses

					if (itemSet) {
						Component()
							.style('item-tooltip-perks-perk', 'item-tooltip-perks-perk--intrinsic')
							.append(Component()
								.style('item-tooltip-perks-perk-label', 'item-tooltip-perks-perk-label--set-bonus')
								.text.set(itemSet.definition.displayProperties.name)
							)
							.append(...itemSet.perks.map(perk => Image(`https://www.bungie.net${perk.definition.displayProperties.icon}`)
								.style('item-tooltip-perks-perk-icon')
							))
							.appendTo(slot)
					}

					//#endregion
					////////////////////////////////////

					////////////////////////////////////
					//#region Perks

					const perks = sockets.filter(Categorisation.IsPerk)
					for (const socket of perks)
						Socket(socket, undefined, isCollections)
							?.appendTo(slot)

					//#endregion
					////////////////////////////////////
				},
			)
		})
		.appendTo(tooltip.body)

	//#endregion
	////////////////////////////////////

	const flavourText = state.map(tooltip, ({ definition }) => definition.flavorText)
	Component()
		.style('item-tooltip-flavour-text-wrapper')
		.append(Lore().style('item-tooltip-flavour-text').text.bind(flavourText))
		.appendToWhen(flavourText.truthy, tooltip.extra)

	////////////////////////////////////
	//#region Sources

	const sourceList = DisplaySlot()
		.style('item-tooltip-source-list')
		.appendTo(tooltip.extra)
	sourceList.use(state, (slot, { definition, provider: collections }) => {
		const sources = definition.sources
		if (!sources?.length)
			return

		interface SourceWrapperExtensions {
			readonly icon?: Component<HTMLImageElement>
			readonly title: Component
			readonly subtitle?: Component
		}

		interface SourceWrapper extends Component, SourceWrapperExtensions { }

		const SourceWrapper = Component((component, display: SourceDisplay): SourceWrapper => {
			const icon = !display.icon ? undefined
				: Image(DisplayProperties.icon(display.icon)).style('item-tooltip-source-icon')
			const title = Component()
				.style('item-tooltip-source-title')
				.text.set(display.name)
			const subtitle = !display.subtitle ? undefined : Component()
				.style('item-tooltip-source-subtitle')
				.text.set(display.subtitle)
			return component
				.style('item-tooltip-source')
				.style.toggle(!!display.icon, 'item-tooltip-source--has-icon')
				.append(icon, title, subtitle)
				.extend<SourceWrapperExtensions>(wrapper => ({
					icon, title, subtitle,
				}))
				.tweak(display.tweak)
		})

		let displayIndex = 0
		for (const source of sources) {
			const display = resolveDisplay(source)
			if (!display)
				continue

			SourceWrapper(display)
				.style.toggle(!!displayIndex++, 'item-tooltip-source--additional')
				.appendTo(slot)
		}

		interface SourceDisplay {
			name: StringApplicatorSource
			subtitle?: StringApplicatorSource
			icon?: string
			tweak?(wrapper: SourceWrapper): unknown
		}

		function resolveDisplay (sourceRef: ItemSource): SourceDisplay | undefined {
			switch (sourceRef.type) {
				case 'defined': {
					const source = collections.sources[sourceRef.id]
					const displayProperties = source?.displayProperties
					if (!displayProperties?.name)
						return undefined

					if (sourceRef.eventState === 'unknown')
						return undefined

					const isUpcomingEvent = sourceRef.eventState === 'upcoming'

					let subtitle: StringApplicatorSource | undefined = _
						?? (source.category === DeepsightItemSourceCategory.ActivityReward ? quilt => quilt['item-tooltip/source/type/activity-reward']() : undefined)
						?? (source.category === DeepsightItemSourceCategory.EventReward ? quilt => quilt['item-tooltip/source/type/event-reward'](isUpcomingEvent) : undefined)
						?? (source.category === DeepsightItemSourceCategory.EventVendor ? quilt => quilt['item-tooltip/source/type/event-vendor'](isUpcomingEvent) : undefined)
						?? (source.category === DeepsightItemSourceCategory.SeasonPass ? quilt => quilt['item-tooltip/source/type/season-pass']() : undefined)
						?? (source.category === DeepsightItemSourceCategory.Vendor
							? quilt => quilt[source.rotates ? 'item-tooltip/source/type/vendor-rotation' : 'item-tooltip/source/type/vendor']()
							: undefined
						)

					if (source.displayProperties.subtitle) {
						const baseSubtitle = subtitle
						subtitle = quilt => quilt['item-tooltip/source/subtitle'](
							displayProperties.subtitle,
							typeof baseSubtitle === 'function' ? baseSubtitle(quilt) : baseSubtitle,
						)
					}

					const hasLore = !!source.displayProperties.subtitle && (false
						|| source.category === DeepsightItemSourceCategory.ExoticMission
						|| source.category === DeepsightItemSourceCategory.Dungeon
						|| source.category === DeepsightItemSourceCategory.Raid
					)

					const icon = displayProperties.icon
					return {
						name: displayProperties.name,
						subtitle,
						icon,
						tweak: wrapper => (wrapper.subtitle
							?.style.toggle(hasLore, 'item-tooltip-source-subtitle--lore')
						),
					}
				}
				case 'table': {
					const table = collections.dropTables[sourceRef.id]
					if (!table?.displayProperties?.name)
						return undefined

					return {
						name: table.displayProperties.name,
						subtitle: table.type === 'bonus-focus'
							? quilt => table.typeDisplayProperties.name
								? quilt['item-tooltip/source/subtitle'](table.typeDisplayProperties.name, quilt['item-tooltip/source/type/bonus-focus']())
								: quilt['item-tooltip/source/type/bonus-focus']()
							: table.displayProperties.description,
						icon: table.displayProperties.icon,
						tweak: wrapper => {
							if (table.type === 'raid' || table.type === 'dungeon')
								wrapper.subtitle?.style('item-tooltip-source-subtitle--lore')

							const mainDropTableEntry = table.dropTable?.[definition.hash as never]
							const realEncounters = (table.encounters ?? []).filter(encounter => !encounter.traversal)
							const encountersDroppingItem = realEncounters
								.filter(encounter => mainDropTableEntry || encounter.dropTable?.[definition.hash as never])

							let displayIndex = 0
							for (const encounter of encountersDroppingItem) {
								if (!encounter.displayProperties.name)
									continue

								const encounterIndex = realEncounters.indexOf(encounter) + 1

								// const dropTableEntry = mainDropTableEntry ?? encounter.dropTable?.[item.hash as never]
								const display: SourceDisplay = {
									name: encounter.displayProperties.name,
									subtitle: encounter.displayProperties.description ?? encounter.displayProperties.directive,
									icon: encounter.displayProperties.icon,
								}
								const encounterWrapper = SourceWrapper(display)
									.style('item-tooltip-source-encounter')
									.style.toggle(!!displayIndex++, 'item-tooltip-source-encounter--additional')
									.appendTo(wrapper)

								encounterWrapper.title.style('item-tooltip-source-encounter-title')
								encounterWrapper.subtitle?.style('item-tooltip-source-encounter-subtitle', 'item-tooltip-source-subtitle--lore')

								Component()
									.style('item-tooltip-source-icon', 'item-tooltip-source-encounter-number')
									.text.set(`${encounterIndex}`)
									.insertTo(encounterWrapper, 'after', encounterWrapper.icon)

								encounterWrapper.icon?.remove()
							}
						},
					}
				}
			}
		}
	})

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Armour Set Details

	Component()
		.style('item-tooltip-armour-set-details')
		.tweak(details => details
			.append(Component()
				.style('item-tooltip-armour-set-details-title')
				.append(Component()
					.style('item-tooltip-armour-set-details-title-text')
					.text.bind(itemSet.map(details, itemSet => itemSet?.definition.displayProperties.name))
				)
			)
			.append(DisplaySlot().style('item-tooltip-armour-set-details-perk-list').use(itemSet, (slot, itemSet) => {
				if (!itemSet?.perks.length)
					return

				for (const perk of itemSet.perks)
					Component()
						.style('item-tooltip-armour-set-details-perk')
						.append(Image(`https://www.bungie.net${perk.definition.displayProperties.icon}`)
							.style('item-tooltip-armour-set-details-perk-icon')
						)
						.append(Component()
							.style('item-tooltip-armour-set-details-perk-label')
							.append(Component()
								.style('item-tooltip-armour-set-details-perk-label-title')
								.text.set(perk.definition.displayProperties.name)
							)
							.append(Component()
								.style('item-tooltip-armour-set-details-perk-label-separator')
								.text.set('/')
							)
							.append(Component()
								.style('item-tooltip-armour-set-details-perk-label-requirement')
								.text.set(quilt => quilt['item-tooltip/armour-set/perk-requirement'](perk.requiredSetCount, 5))
							)
						)
						.append(Paragraph()
							.style('item-tooltip-armour-set-details-perk-description')
							.text.set(perk.definition.displayProperties.description)
						)
						.appendTo(slot)
			}))
		)
		.appendToWhen(itemSet.truthy, tooltip.extra)

	//#endregion
	////////////////////////////////////

	state.use(tooltip, () => tooltip.rect.markDirty())
	return tooltip
})

export default TooltipManager(ItemTooltip, {
	states: {
		state: undefined as State.Mutable<ItemState> | undefined,
	},
	update (states, state: State.Or<ItemState>) {
		states.updateState(state)
	},
	build (states, tooltip, state: State.Or<ItemState>) {
		return tooltip.and(ItemTooltip,
			states.state ??= State.Mutable(tooltip, state),
		)
	},
	onHover (states, state: State.Or<ItemState>) {
		state = State.value(state)
		console.log(state.definition.displayProperties.name, state)
	},
})

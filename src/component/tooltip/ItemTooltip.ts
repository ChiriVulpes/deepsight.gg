import type { DestinyEquipableItemSetDefinition } from 'bungie-api-ts/destiny2/interfaces'
import DisplaySlot from 'component/core/DisplaySlot'
import Image from 'component/core/Image'
import Lore from 'component/core/Lore'
import Power from 'component/item/Power'
import Stats from 'component/item/Stats'
import type Collections from 'conduit.deepsight.gg/Collections'
import type { Item, ItemAmmo, ItemPlug, ItemSocket, ItemSource } from 'conduit.deepsight.gg/Collections'
import type { SandboxPerkHashes } from 'deepsight.gg/Enums'
import { DeepsightItemSourceCategory } from 'deepsight.gg/Interfaces'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import Tooltip from 'kitsui/component/Tooltip'
import type { StringApplicatorSource } from 'kitsui/utility/StringApplicator'
import Categorisation from 'utility/Categorisation'
import { _ } from 'utility/Objects'
import TooltipManager from 'utility/TooltipManager'

const PLUG_ARCHETYPE_ICON_SEQUENCE = 0
const PLUG_ARCHETYPE_ICON_SEQUENCE_FRAME = 1

const ItemTooltip = Component((component, item: State<Item>, collections: State<Collections>) => {
	const tooltip = component.as(Tooltip)!
		.anchor.reset()
		.anchor.add('off right', 'sticky centre')
		.anchor.add('off left', 'sticky centre')

	const rarity = item.map(tooltip, item => collections.value.rarities[item.rarity])
	const isCollections = item.map(tooltip, item => !item.instanceId)

	tooltip.style.bindFrom(rarity.map(tooltip, rarity => `item-tooltip--${rarity.displayProperties.name!.toLowerCase()}` as 'item-tooltip--common'))

	////////////////////////////////////
	//#region Header

	tooltip.header.style('item-tooltip-header')

	Component()
		.style('item-tooltip-title')
		.text.bind(item.map(tooltip, item => item.displayProperties.name))
		.appendTo(tooltip.header)

	Component()
		.style('item-tooltip-subtitle')
		.append(Component()
			.style('item-tooltip-subtitle-type')
			.text.bind(item.map(tooltip, item => item.type))
		)
		.append(Component()
			.style('item-tooltip-subtitle-rarity')
			.text.bind(rarity.map(tooltip, rarity => rarity.displayProperties.name))
		)
		.appendTo(tooltip.header)

	////////////////////////////////////
	//#region Watermark

	const featured = item.map(tooltip, item => !!item.featuredWatermark)
	Component()
		.style('item-tooltip-watermark')
		.style.bind(featured, 'item-tooltip-watermark--featured')
		.style.bindVariable('item-watermark', item.map(tooltip, item => `url(https://www.bungie.net${item.watermark})`))
		.appendTo(tooltip.header)

	const tier = item.map(tooltip, item => item.tier)
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

	Power(State.Use(primaryInfo, { damageTypes: item.map(primaryInfo, item => item.damageTypes) }), collections)
		.style('item-tooltip-damage')
		.appendTo(primaryInfo)

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Secondary Type

	const ammo = State.Map(tooltip, [item, collections], (item, collections): ItemAmmo | undefined => collections.ammoTypes[item.ammo!])
	const archetype = State.Map(tooltip, [item, collections], (item, collections): ItemPlug | undefined => {
		const socketPlugHash = item.sockets.find(socket => socket.type === 'Intrinsic/ArmorArchetype')?.defaultPlugHash
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
		.and(Stats, item, collections, { isAbbreviated: true })
		.tweak(stats => {
			stats.style.bind(stats.anyVisible.falsy, 'item-tooltip-stats--no-visible-stats')
			stats.appendToWhen(stats.hasStats, tooltip.body)
		})

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Perks

	const perks = item.map(tooltip, item => item.sockets.filter(socket => Categorisation.IsIntrinsicPerk(socket) || Categorisation.IsPerk(socket)))
	const itemSet = item.map(tooltip, (item): DestinyEquipableItemSetDefinition | undefined => collections.value.itemSets[item.itemSetHash!])
	Component()
		.style('item-tooltip-perks')
		.tweak(wrapper => {
			Slot().appendTo(wrapper).use(
				State.Use(wrapper, { sockets: perks, itemSet, isCollections, collections }),
				(slot, { sockets, itemSet, isCollections, collections }) => {
					////////////////////////////////////
					//#region Socket component

					const Plugs = (socket: ItemSocket) => socket.plugs
						.map(plugHash => collections.plugs[plugHash])
						.filter(plug => !!plug)

					const Socket = Component((wrapper, socket: ItemSocket, plugs?: ItemPlug[], noSocketed?: boolean) => {
						wrapper.style('item-tooltip-perks-perk')

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
							?? collections.plugs[socket.defaultPlugHash!]
							?? (!isCollectionsRoll ? plugs.at(0) : undefined)
						) as ItemPlug | undefined
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

					const intrinsics = sockets.filter(socket => !Categorisation.IsPerk(socket) && !Categorisation.IsExoticCatalyst(socket))
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
						const realCatalystPlug = exoticCatalyst.plugs.map(plugHash => collections.plugs[plugHash]).find(plug => plug.type === 'Masterwork/ExoticCatalyst')
						const perks = (realCatalystPlug?.perks ?? []).map(perkHash => collections.perks[perkHash]).filter(perk => !!perk)
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
						const perks = itemSet.setPerks
							.sort((a, b) => b.requiredSetCount - a.requiredSetCount)
							.map(perk => collections.perks[perk.sandboxPerkHash as SandboxPerkHashes])
							.filter(perk => !!perk)
						Component()
							.style('item-tooltip-perks-perk', 'item-tooltip-perks-perk--intrinsic')
							.append(Component()
								.style('item-tooltip-perks-perk-label', 'item-tooltip-perks-perk-label--set-bonus')
								.text.set(itemSet.displayProperties.name)
							)
							.append(...perks.map(perk => Image(`https://www.bungie.net${perk.displayProperties.icon}`)
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

	const flavourText = item.map(tooltip, item => item.flavorText)
	Component()
		.style('item-tooltip-flavour-text-wrapper')
		.append(Lore().style('item-tooltip-flavour-text').text.bind(flavourText))
		.appendToWhen(flavourText.truthy, tooltip.extra)

	const sourceList = DisplaySlot()
		.style('item-tooltip-source-list')
		.appendTo(tooltip.extra)
	sourceList.use(State.Use(tooltip, { item, collections }), (slot, { item, collections }) => {
		const sources = item.sources
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
				: Image(`https://www.bungie.net${display.icon}`).style('item-tooltip-source-icon')
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

					let subtitle: StringApplicatorSource | undefined = _
						?? (source.category === DeepsightItemSourceCategory.ActivityReward ? quilt => quilt['item-tooltip/source/type/activity-reward']() : undefined)
						?? (source.category === DeepsightItemSourceCategory.EventReward ? quilt => quilt['item-tooltip/source/type/event-reward']() : undefined)
						?? (source.category === DeepsightItemSourceCategory.EventVendor ? quilt => quilt['item-tooltip/source/type/event-vendor']() : undefined)
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

					const icon = displayProperties.icon
					return {
						name: displayProperties.name,
						subtitle,
						icon,
					}
				}
				case 'table': {
					const table = collections.dropTables[sourceRef.id]
					if (!table?.displayProperties?.name)
						return undefined

					return {
						name: table.displayProperties.name,
						subtitle: table.type === 'bonus-focus' ? quilt => quilt['item-tooltip/source/type/bonus-focus']() : table.displayProperties.description,
						icon: table.displayProperties.icon,
						tweak: wrapper => {
							if (table.type === 'raid' || table.type === 'dungeon')
								wrapper.subtitle?.style('item-tooltip-source-subtitle--lore')

							const mainDropTableEntry = table.dropTable?.[item.hash as never]
							const realEncounters = (table.encounters ?? []).filter(encounter => !encounter.traversal)
							const encountersDroppingItem = realEncounters
								.filter(encounter => mainDropTableEntry || encounter.dropTable?.[item.hash as never])

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

	State.Use(tooltip, { item, collections }, () => tooltip.rect.markDirty())
	return tooltip
})

export default TooltipManager(ItemTooltip, {
	states: {
		item: undefined as State.Mutable<Item> | undefined,
		collections: undefined as State.Mutable<Collections> | undefined,
	},
	update (states, plug: State.Or<Item>, collections: State.Or<Collections>) {
		states.updateItem(plug)
		states.updateCollections(collections)
	},
	build (states, tooltip, item: State.Or<Item>, collections: State.Or<Collections>) {
		item = State.get(item)
		collections = State.get(collections)
		return tooltip.and(ItemTooltip,
			states.item ??= State.Mutable(tooltip, item),
			states.collections ??= State.Mutable(tooltip, collections),
		)
	},
	onHover (states, item: State.Or<Item>, collections: State.Or<Collections>) {
		item = State.value(item)
		console.log(item.displayProperties.name, item)
	},
})

import type { DestinyEquipableItemSetDefinition } from 'bungie-api-ts/destiny2/interfaces'
import Image from 'component/core/Image'
import type Collections from 'conduit.deepsight.gg/Collections'
import type { Item, ItemAmmo, ItemPlug, ItemSocket } from 'conduit.deepsight.gg/Collections'
import type { DamageTypeHashes, SandboxPerkHashes } from 'deepsight.gg/Enums'
import { StatHashes } from 'deepsight.gg/Enums'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import Tooltip from 'kitsui/component/Tooltip'
import Relic from 'Relic'
import Categorisation from 'utility/Categorisation'
import { _ } from 'utility/Objects'

const prismaticIcon = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected
	const loadoutIcon = await conduit.definitions.en.DestinyLoadoutIconDefinition.get(814121290)
	return loadoutIcon?.iconImagePath
})

const PLUG_ARCHETYPE_ICON_SEQUENCE = 0
const PLUG_ARCHETYPE_ICON_SEQUENCE_FRAME = 1

const STATS_FILTERED_OUT = new Set<StatHashes>([
	StatHashes.Impact,
	StatHashes.AimAssistance,
	StatHashes.Zoom,
	StatHashes.AirborneEffectiveness,
	StatHashes.AmmoGeneration,
	StatHashes.RecoilDirection,
])

export default Component((component, item: State.Or<Item>, collections: State.Or<Collections>) => {
	item = State.get(item)
	collections = State.get(collections)

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

	// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
	const primaryDamageType = State.Map(tooltip, [item, collections], (item, collections) => collections.damageTypes[item.damageTypes?.[0]!])
	const damageTypes = item.map(tooltip, item => item.damageTypes, (a, b) => a?.toSorted().join(',') === b?.toSorted().join(','))
	function getDamageTypeName (damageType: DamageTypeHashes | undefined): string | undefined {
		const def = damageType === undefined ? undefined : (collections as State<Collections>).value.damageTypes[damageType]
		return def?.displayProperties.name.toLowerCase()
	}
	Component()
		.style('item-tooltip-damage')
		.appendWhen(primaryDamageType.truthy, Component()
			.style('item-tooltip-damage-icon')
			.tweak(wrapper => {
				wrapper.style.bindFrom(damageTypes.map(wrapper, damageTypes =>
					damageTypes?.length !== 1 ? undefined : `item-tooltip-damage-icon--solo-${getDamageTypeName(damageTypes[0])?.toLowerCase() as 'strand'}` as const
				))
				State.Use(wrapper, { primaryDamageType, damageTypes, prismaticIcon }).use(wrapper, ({ damageTypes, prismaticIcon }) => {
					wrapper.removeContents()
					wrapper.style.remove('item-tooltip-damage-icon--1', 'item-tooltip-damage-icon--2', 'item-tooltip-damage-icon--3')
					if (damageTypes?.length === 5) {
						wrapper.style('item-tooltip-damage-icon--1')
						Component()
							.style('item-tooltip-damage-icon-image', 'item-tooltip-damage-icon-image--prismatic')
							.style.bindVariable('item-tooltip-damage-image', `url(https://www.bungie.net${prismaticIcon})`)
							.appendTo(wrapper)
						const gradientFixer = Component()
							.style('item-tooltip-damage-icon-image-prismatic-gradient-fixer')
							.appendTo(wrapper)
						for (let i = 0; i < 4; i++)
							Component()
								.style('item-tooltip-damage-icon-image', 'item-tooltip-damage-icon-image--prismatic')
								.style.bindVariable('item-tooltip-damage-image', `url(https://www.bungie.net${prismaticIcon})`)
								.appendTo(gradientFixer)
						return
					}

					wrapper.style(`item-tooltip-damage-icon--${damageTypes?.length ?? 1}` as 'item-tooltip-damage-icon--1')
					for (const damageType of damageTypes ?? []) {
						const def = collections.value.damageTypes[damageType]
						const damageTypeName = def.displayProperties.name.toLowerCase()
						Component()
							.style('item-tooltip-damage-icon-image', `item-tooltip-damage-icon-image--${damageTypeName as 'prismatic'}`)
							.style.bindVariable('item-tooltip-damage-image', `url(https://www.bungie.net${def.displayProperties.icon})`)
							.appendTo(wrapper)
					}
				})
			})
		)
		.append(Component()
			.style('item-tooltip-damage-power')
			.tweak(wrapper => {
				damageTypes.use(wrapper, (damageTypes = []) => {
					const single = damageTypes.length === 5 || damageTypes.length <= 1
					wrapper.style.toggle(single, 'item-tooltip-damage-power--colour')
					wrapper.style.toggle(!single, 'item-tooltip-damage-power--gradient')
					const damageTypeColourVars = damageTypes
						.map(type => collections.value.damageTypes[type]?.displayProperties.name.toLowerCase())
						.map(name => `var(--colour-damage-${name ?? 'kinetic'})`)
					wrapper.style.setVariable('item-tooltip-damage-colour', damageTypes.length === 5 ? 'var(--colour-damage-prismatic)' : damageTypeColourVars[0])
					const gradient = damageTypes.length === 1 ? damageTypeColourVars[0]
						: damageTypes.length === 2 ? `${damageTypeColourVars[0]} 30%, ${damageTypeColourVars[1]} 70%`
							: damageTypes.length === 3 ? `${damageTypeColourVars[0]} 20%, ${damageTypeColourVars[1]} 45%, ${damageTypeColourVars[1]} 55%, ${damageTypeColourVars[2]} 80%`
								: `${damageTypeColourVars[0]} 20%, ${damageTypeColourVars[1]} 40%, ${damageTypeColourVars[2]} 60%, ${damageTypeColourVars[3]} 80%`
					wrapper.style.setVariable('item-tooltip-damage-gradient', `linear-gradient(130deg in oklab, ${gradient}`)
				})
			})
			.text.set('10')
		)
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

	const statsVisible = State(false)
	const hasStats = State(false)
	Component()
		.style('item-tooltip-stats')
		.style.bind(statsVisible.falsy, 'item-tooltip-stats--no-visible-stats')
		.tweak(wrapper => {
			State.Use(wrapper, { item, collections }, ({ item, collections }) => {
				wrapper.removeContents()

				let _barStatsWrapper: Component | undefined
				let _numericStatsWrapper: Component | undefined
				const barStatsWrapper = () => _barStatsWrapper ??= Component().style('item-tooltip-stats-section').prependTo(wrapper)
				const numericStatsWrapper = () => _numericStatsWrapper ??= Component().style('item-tooltip-stats-section').appendTo(wrapper)

				const statGroupDef = collections.statGroups[item.statGroupHash!]
				hasStats.value = !!statGroupDef.scaledStats.length

				const stats = !item.stats ? [] : Object.values(item.stats)
					.sort((a, b) => 0
						|| +(a.displayAsNumeric ?? false) - +(b.displayAsNumeric ?? false)
						|| (statGroupDef.scaledStats.findIndex(stat => stat.statHash as StatHashes === a.hash) ?? 0) - (statGroupDef.scaledStats.findIndex(stat => stat.statHash as StatHashes === b.hash) ?? 0)
						|| (collections.stats[a.hash]?.index ?? 0) - (collections.stats[b.hash]?.index ?? 0)
					)

				let hasVisibleStat = false
				for (const stat of stats) {
					const def = collections.stats[stat.hash]
					const overrideDisplayProperties = statGroupDef?.overrides?.[stat.hash]?.displayProperties
					const statName = (overrideDisplayProperties ?? def?.displayProperties)?.name ?? ''
					if (!statName || STATS_FILTERED_OUT.has(stat.hash))
						continue

					hasVisibleStat = true

					Component()
						.style('item-tooltip-stats-stat')
						.append(Component()
							.style('item-tooltip-stats-stat-label')
							.text.set(statName)
						)
						.append(!stat.displayAsNumeric && Component()
							.style('item-tooltip-stats-stat-bar')
							.style.bindVariable('item-tooltip-stats-stat-bar-progress', stat.value / (stat.max ?? 100))
						)
						.append(Component()
							.style('item-tooltip-stats-stat-value')
							.text.set(stat.value.toLocaleString(navigator.language))
						)
						.appendTo(stat.displayAsNumeric ? numericStatsWrapper() : barStatsWrapper())
				}

				statsVisible.value = hasVisibleStat
			})
		})
		.appendToWhen(hasStats, tooltip.body)

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
							Image(`https://www.bungie.net${socketed?.displayProperties.icon}`)
								.style('item-tooltip-perks-perk-icon')
								.appendTo(wrapper)

							Component()
								.style('item-tooltip-perks-perk-label')
								.text.set(socketed?.displayProperties.name)
								.appendTo(wrapper)
						}

						const isSocketedEnhanced = Categorisation.IsEnhanced(socketed)
						const additionalPlugs = plugs.filter(plug => true
							&& plug.hash !== socketed?.hash
							&& (isSocketedEnhanced || !Categorisation.IsEnhanced(plug))
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

	State.Use(tooltip, { item, collections }, () => tooltip.rect.markDirty())
	return tooltip
})

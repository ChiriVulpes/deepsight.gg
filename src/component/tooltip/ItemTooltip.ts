import type Collections from 'conduit.deepsight.gg/Collections'
import type { CollectionsItem } from 'conduit.deepsight.gg/Collections'
import { Component, State } from 'kitsui'
import Tooltip from 'kitsui/component/Tooltip'
import Relic from 'Relic'

const prismaticIcon = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected
	const loadoutIcon = await conduit.definitions.en.DestinyLoadoutIconDefinition.get(814121290)
	return loadoutIcon?.iconImagePath
})

export default Component((component, item: State.Or<CollectionsItem>, collections: State.Or<Collections>) => {
	item = State.get(item)
	collections = State.get(collections)

	const rarity = item.map(component, item => collections.value.rarities[item.rarity])
	const featured = item.map(component, item => !!item.featuredWatermark)
	const tier = item.map(component, item => item.tier)

	const tooltip = component.as(Tooltip)!
		.anchor.reset()
		.anchor.add('off right', 'sticky centre')
		.anchor.add('off left', 'sticky centre')
		.style.bindFrom(rarity.map(component, rarity => `item-tooltip--${rarity.displayProperties.name!.toLowerCase()}` as 'item-tooltip--common'))

	tooltip.header.style('item-tooltip-header')

	Component()
		.style('item-tooltip-title')
		.text.bind(item.map(component, item => item.displayProperties.name))
		.appendTo(tooltip.header)

	Component()
		.style('item-tooltip-subtitle')
		.append(Component()
			.style('item-tooltip-subtitle-type')
			.text.bind(item.map(component, item => item.type))
		)
		.append(Component()
			.style('item-tooltip-subtitle-rarity')
			.text.bind(rarity.map(component, rarity => rarity.displayProperties.name))
		)
		.appendTo(tooltip.header)

	Component()
		.style('item-tooltip-watermark')
		.style.bind(featured, 'item-tooltip-watermark--featured')
		.style.bindVariable('item-watermark', item.map(component, item => `url(https://www.bungie.net${item.watermark})`))
		.appendTo(tooltip.header)

	Component()
		.style('item-tooltip-watermark-tier')
		.style.bindFrom(tier.map(component, tier => `item-tooltip-watermark-tier--${tier}` as 'item-tooltip-watermark-tier--4'))
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

	const primaryInfo = Component()
		.style('item-tooltip-primary-info')
		.appendTo(tooltip.body)

	// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
	const primaryDamageType = State.Map(component, [item, collections], (item, collections) => collections.damageTypes[item.damageTypes?.[0]!])
	const damageTypes = item.map(component, item => item.damageTypes, (a, b) => a?.toSorted().join(',') === b?.toSorted().join(','))
	Component()
		.style('item-tooltip-damage')
		.appendWhen(primaryDamageType.truthy, Component()
			.style('item-tooltip-damage-icon')
			.tweak(wrapper => {
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
						Component()
							.style('item-tooltip-damage-icon-image', `item-tooltip-damage-icon-image--${def.displayProperties.name.toLowerCase() as 'prismatic'}`)
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

	return tooltip
})

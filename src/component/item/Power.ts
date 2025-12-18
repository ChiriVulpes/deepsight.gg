import type Collections from 'conduit.deepsight.gg/item/Collections'
import type { DamageTypeHashes } from 'deepsight.gg/Enums'
import { Component, State } from 'kitsui'
import Relic from 'Relic'

const prismaticIcon = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected
	const loadoutIcon = await conduit.definitions.en.DestinyLoadoutIconDefinition.get(814121290)
	return loadoutIcon?.iconImagePath
})

interface PowerState {
	power?: number
	damageTypes?: DamageTypeHashes[]
}

export default Component((component, power: State<PowerState | undefined>, collections: State.Or<Collections>) => {
	collections = State.get(collections)

	component.style('power')

	// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
	const primaryDamageType = State.Map(component, [power, collections], (power, collections) => collections.damageTypes[power?.damageTypes?.[0]!])
	const damageTypes = power.map(component, power => power?.damageTypes, (a, b) => a?.toSorted().join(',') === b?.toSorted().join(','))
	function getDamageTypeName (damageType: DamageTypeHashes | undefined): string | undefined {
		const def = damageType === undefined ? undefined : (collections as State<Collections>).value.damageTypes[damageType]
		return def?.displayProperties.name.toLowerCase()
	}

	Component()
		.style('power-damage-icon')
		.tweak(wrapper => {
			wrapper.style.bindFrom(damageTypes.map(wrapper, damageTypes =>
				damageTypes?.length !== 1 ? undefined : `power-damage-icon--solo-${getDamageTypeName(damageTypes[0])?.toLowerCase() as 'strand'}` as const
			))
			State.Use(wrapper, { primaryDamageType, damageTypes, prismaticIcon }).use(wrapper, ({ damageTypes, prismaticIcon }) => {
				wrapper.removeContents()
				wrapper.style.remove('power-damage-icon--1', 'power-damage-icon--2', 'power-damage-icon--3')
				if (damageTypes?.length === 5) {
					wrapper.style('power-damage-icon--1')
					Component()
						.style('power-damage-icon-image', 'power-damage-icon-image--prismatic')
						.style.bindVariable('power-damage-image', `url(https://www.bungie.net${prismaticIcon})`)
						.appendTo(wrapper)
					const gradientFixer = Component()
						.style('power-damage-icon-image-prismatic-gradient-fixer')
						.appendTo(wrapper)
					for (let i = 0; i < 4; i++)
						Component()
							.style('power-damage-icon-image', 'power-damage-icon-image--prismatic')
							.style.bindVariable('power-damage-image', `url(https://www.bungie.net${prismaticIcon})`)
							.appendTo(gradientFixer)
					return
				}

				wrapper.style(`power-damage-icon--${damageTypes?.length ?? 1}` as 'power-damage-icon--1')
				for (const damageType of damageTypes ?? []) {
					const def = collections.value.damageTypes[damageType]
					const damageTypeName = def.displayProperties.name.toLowerCase()
					Component()
						.style('power-damage-icon-image', `power-damage-icon-image--${damageTypeName as 'prismatic'}`)
						.style.bindVariable('power-damage-image', `url(https://www.bungie.net${def.displayProperties.icon})`)
						.appendTo(wrapper)
				}
			})
		})
		.appendToWhen(primaryDamageType.truthy, component)

	Component()
		.style('power-power')
		.tweak(wrapper => {
			damageTypes.use(wrapper, (damageTypes = []) => {
				const single = damageTypes.length === 5 || damageTypes.length <= 1
				wrapper.style.toggle(single, 'power-power--colour')
				wrapper.style.toggle(!single, 'power-power--gradient')
				const damageTypeColourVars = damageTypes
					.map(type => collections.value.damageTypes[type]?.displayProperties.name.toLowerCase())
					.map(name => `var(--colour-damage-${name ?? 'kinetic'})`)
				wrapper.style.setVariable('power-damage-colour', damageTypes.length === 5 ? 'var(--colour-damage-prismatic)' : damageTypeColourVars[0])
				const gradient = damageTypes.length === 1 ? damageTypeColourVars[0]
					: damageTypes.length === 2 ? `${damageTypeColourVars[0]} 30%, ${damageTypeColourVars[1]} 70%`
						: damageTypes.length === 3 ? `${damageTypeColourVars[0]} 20%, ${damageTypeColourVars[1]} 45%, ${damageTypeColourVars[1]} 55%, ${damageTypeColourVars[2]} 80%`
							: `${damageTypeColourVars[0]} 20%, ${damageTypeColourVars[1]} 40%, ${damageTypeColourVars[2]} 60%, ${damageTypeColourVars[3]} 80%`
				wrapper.style.setVariable('power-damage-gradient', `linear-gradient(130deg in oklab, ${gradient}`)
			})
		})
		.text.set('10')
		.appendTo(component)

	return component
})

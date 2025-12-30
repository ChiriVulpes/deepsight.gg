import type { ItemProvider } from 'conduit.deepsight.gg/item/Item'
import type { DamageTypeHashes } from 'deepsight.gg/Enums'
import { Component, State } from 'kitsui'
import type { ItemStateOptional } from 'model/Items'
import Relic from 'Relic'

const prismaticIcon = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected
	const loadoutIcon = await conduit.definitions.en.DestinyLoadoutIconDefinition.get(814121290)
	return loadoutIcon?.iconImagePath
})

export interface PowerState {
	power?: number
	damageTypes?: DamageTypeHashes[]
	provider: ItemProvider
}

export namespace PowerState {
	export function fromItemState (state: ItemStateOptional): PowerState
	export function fromItemState (state: State<ItemStateOptional>): State<PowerState>
	export function fromItemState (state: State.Or<ItemStateOptional>): State.Or<PowerState>
	export function fromItemState (state: State.Or<ItemStateOptional>): State.Or<PowerState> {
		if (State.is(state))
			return state.mapManual(fromItemState)

		return {
			damageTypes: state.definition?.damageTypeHashes,
			provider: state.provider,
		}
	}
}

export default Component((component, state: State<PowerState>) => {
	component.style('power')

	const primaryDamageType = state.map(component, state => state.provider.damageTypes[state.damageTypes?.[0]!])
	const damageTypes = state.map(component, state => state.damageTypes, (a, b) => a?.toSorted().join(',') === b?.toSorted().join(','))
	function getDamageTypeName (damageType: DamageTypeHashes | undefined): string | undefined {
		const def = damageType === undefined ? undefined : state.value.provider.damageTypes[damageType]
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
					const def = state.value.provider.damageTypes[damageType]
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
					.map(type => state.value.provider.damageTypes[type]?.displayProperties.name.toLowerCase())
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

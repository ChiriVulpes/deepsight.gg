import { DestinyAmmunitionType } from 'bungie-api-ts/destiny2'
import Filter from 'component/display/Filter'
import { PresentationNodeHashes } from 'deepsight.gg/Enums'
import { State } from 'kitsui'
import { NonNullish } from 'kitsui/utility/Arrays'
import Relic from 'Relic'

const DestinyAmmoDefinition = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected

	const ammoTypes = [
		[DestinyAmmunitionType.Primary, PresentationNodeHashes.Primary_ObjectiveHashUndefined],
		[DestinyAmmunitionType.Special, PresentationNodeHashes.Special_Scope0],
		[DestinyAmmunitionType.Heavy, PresentationNodeHashes.Heavy_ObjectiveHashUndefined],
	]

	const nodes = await Promise.all(ammoTypes
		.map(([, nodeHash]) => conduit.definitions.en.DestinyPresentationNodeDefinition.get(nodeHash))
	)

	return nodes.map(node => node && {
		displayProperties: node?.displayProperties,
		hash: ammoTypes.find(([, nodeHash]) => nodeHash === node.hash)?.[0] ?? DestinyAmmunitionType.None,
	})
})

const prefix = 'ammo:'

export default Filter.Definition({
	id: 'ammo',
	type: 'or',
	suggestions: DestinyAmmoDefinition.mapManual(defs => {
		return Object.values(defs ?? {})
			.filter(NonNullish)
			.map(def => def?.displayProperties?.name)
			.filter(name => !!name)
			.map(name => `${prefix}${name.toLowerCase()}`)
	}),
	match (owner, token) {
		if (!token.lowercase.startsWith(prefix))
			return undefined

		const element = token.lowercase.slice(prefix.length).trim()
		const ammoType = DestinyAmmoDefinition.map(owner, defs => {
			const matches = Object.values(defs ?? {})
				.filter(def => def?.displayProperties?.name.toLowerCase().startsWith(element))
			return matches.length === 1 ? matches[0] : undefined
		})
		const [labelText, filterText] = token.displayText.split(':')
		return {
			fullText: ammoType.map(owner, def => !def ? token.lowercase : `${prefix}${def.displayProperties.name.toLowerCase()}`),
			isPartial: ammoType.falsy,
			chip (chip, token) {
				chip.style.bindFrom(ammoType.map(chip, def => def && `filter-display-chip--ammo--${def.displayProperties.name.toLowerCase()}` as 'filter-display-chip--ammo--primary'))
				chip.labelText.set(`${labelText}:`)
				chip.text.set(filterText)
			},
			icon: ammoType.map(owner, def => def && `https://www.bungie.net${def.displayProperties.icon}`),
			filter (item, token) {
				return !item.ammo ? 'irrelevant'
					: item.ammo === ammoType.value?.hash
			},
		}
	},
})

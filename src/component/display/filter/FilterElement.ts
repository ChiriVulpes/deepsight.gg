import Image from 'component/core/Image'
import Filter from 'component/display/Filter'
import { DamageTypeHashes } from 'deepsight.gg/Enums'
import { State } from 'kitsui'
import Relic from 'Relic'

const DestinyDamageTypeDefinition = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected
	return await conduit.definitions.en.DestinyDamageTypeDefinition.all()
})

const prefix = 'element:'

const defaultOrder = [
	DamageTypeHashes.Kinetic,
	DamageTypeHashes.Void,
	DamageTypeHashes.Arc,
	DamageTypeHashes.Solar,
	DamageTypeHashes.Stasis,
	DamageTypeHashes.Strand,
]

const suggestions = DestinyDamageTypeDefinition.mapManual(defs => {
	return Object.values(defs ?? {})
		.filter(def => def.hash as DamageTypeHashes !== DamageTypeHashes.Raid)
		.sort((a, b) => defaultOrder.indexOf(a.hash) - defaultOrder.indexOf(b.hash))
		.map(def => def?.displayProperties?.name)
		.filter(name => !!name)
		.map(name => `${prefix}${name.toLowerCase()}`)
})

export default Filter.Definition({
	id: 'element',
	suggestions (owner, token) {
		return suggestions.map(owner, suggestions => {
			return !token ? suggestions : suggestions.filter(suggestion => suggestion.startsWith(token.lowercase))
		})
	},
	match (owner, token) {
		if (!token.lowercase.startsWith(prefix))
			return undefined

		const element = token.lowercase.slice(prefix.length).trim()
		const damageType = DestinyDamageTypeDefinition.map(owner, defs => {
			const matches = Object.values(defs ?? {})
				.filter(def => def?.displayProperties?.name.toLowerCase().startsWith(element))
			return matches.length === 1 ? matches[0] : undefined
		})
		const [labelText, filterText] = token.displayText.split(':')
		return {
			chip (chip, token) {
				chip.style('filter-display-chip--element')
				chip.style.bindFrom(damageType.map(chip, def => def && `filter-display-chip--element--${def.displayProperties.name.toLowerCase()}` as 'filter-display-chip--element--arc'))
				chip.labelText.set(`${labelText}:`)
				chip.text.set(filterText)
			},
			icon (icon, token) {
				Image(damageType.map(icon, def => def && `https://www.bungie.net${def.displayProperties.icon}`))
					.appendToWhen(damageType.truthy, icon)
			},
			filter (item, token) {
				return !item.damageTypes?.length || item.damageTypes.includes(damageType.value?.hash ?? NaN)
			},
		}
	},
})

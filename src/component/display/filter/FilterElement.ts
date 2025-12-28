import Filter from 'component/display/Filter'
import { DamageTypeHashes } from 'deepsight.gg/Enums'
import Definitions from 'model/Definitions'

const prefix = 'element:'

const defaultOrder = [
	DamageTypeHashes.Kinetic,
	DamageTypeHashes.Void,
	DamageTypeHashes.Arc,
	DamageTypeHashes.Solar,
	DamageTypeHashes.Stasis,
	DamageTypeHashes.Strand,
]

export default Filter.Definition({
	id: 'element',
	type: 'or',
	suggestions: Definitions.DestinyDamageTypeDefinition.mapManual(defs => {
		return Object.values(defs ?? {})
			.filter(def => def.hash as DamageTypeHashes !== DamageTypeHashes.Raid)
			.sort((a, b) => defaultOrder.indexOf(a.hash) - defaultOrder.indexOf(b.hash))
			.map(def => def?.displayProperties?.name)
			.filter(name => !!name)
			.map(name => `${prefix}${name.toLowerCase()}`)
	}),
	match (owner, token) {
		if (!token.lowercase.startsWith(prefix))
			return undefined

		const element = token.lowercase.slice(prefix.length).trim()
		const damageType = Definitions.DestinyDamageTypeDefinition.map(owner, defs => {
			const matches = Object.values(defs ?? {})
				.filter(def => def?.displayProperties?.name.toLowerCase().startsWith(element))
			return matches.length === 1 ? matches[0] : undefined
		})
		const [labelText, filterText] = token.displayText.split(':')
		return {
			fullText: damageType.map(owner, def => !def ? token.lowercase : `${prefix}${def.displayProperties.name.toLowerCase()}`),
			isPartial: damageType.falsy,
			chip (chip, token) {
				chip.style.bindFrom(damageType.map(chip, def => def && `filter-display-chip--element--${def.displayProperties.name.toLowerCase()}` as 'filter-display-chip--element--arc'))
				chip.labelText.set(`${labelText}:`)
				chip.text.set(filterText)
			},
			icon: damageType.map(owner, def => def && `https://www.bungie.net${def.displayProperties.icon}`),
			filter (item, token) {
				return !item.damageTypeHashes?.length ? 'irrelevant'
					: item.damageTypeHashes.includes(damageType.value?.hash ?? NaN)
			},
		}
	},
})

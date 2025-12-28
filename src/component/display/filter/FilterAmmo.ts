import Filter from 'component/display/Filter'
import { NonNullish } from 'kitsui/utility/Arrays'
import DestinyAmmoDefinition from 'model/DestinyAmmoDefinition'

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
				return !item.definition.ammoType ? 'irrelevant'
					: item.definition.ammoType === ammoType.value?.hash
			},
		}
	},
})

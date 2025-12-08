import Image from 'component/core/Image'
import Filter from 'component/display/Filter'
import { State } from 'kitsui'
import { ItemCategoryHashes } from 'node_modules/deepsight.gg/Enums'
import Relic from 'Relic'

const DeepsightWeaponTypeDefinition = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected
	return await conduit.definitions.en.DeepsightWeaponTypeDefinition.all()
})

const prefix = 'type:'

export default Filter.Definition({
	id: 'type',
	type: 'or',
	suggestions: DeepsightWeaponTypeDefinition.mapManual(defs => {
		return Object.values(defs ?? {})
			.map(def => def?.displayProperties?.name)
			.filter(name => !!name)
			.map(name => `${prefix}${name.toLowerCase()}`)
	}),
	match (owner, token) {
		if (!token.lowercase.startsWith(prefix))
			return undefined

		const element = token.lowercase.slice(prefix.length).trim().trimQuotes()
		const weaponType = DeepsightWeaponTypeDefinition.map(owner, defs => {
			const matches = Object.values(defs ?? {})
				.filter(def => def?.displayProperties?.name.toLowerCase().startsWith(element))
			return matches.length === 1 ? matches[0] : undefined
		})
		const [labelText, filterText] = token.displayText.split(':')
		return {
			fullText: weaponType.map(owner, def => !def ? token.lowercase : `${prefix}${def.displayProperties.name.toLowerCase()}`),
			isPartial: weaponType.falsy,
			chip (chip, token) {
				chip.style('filter-display-chip--weapon-type')
				chip.labelText.set(`${labelText}:`)
				chip.text.set(filterText)
			},
			doubleWidthIcon: true,
			icon (icon, token) {
				Image(weaponType.map(icon, def => def && `https://www.bungie.net${def.displayProperties.icon}`))
					.style('filter-display-chip-icon--weapon')
					.style.bind(weaponType.map(icon, def => def?.hash === ItemCategoryHashes.Bows), 'filter-display-chip-icon--weapon--bow')
					.style.bind(weaponType.map(icon, def => def?.hash === ItemCategoryHashes.Glaives), 'filter-display-chip-icon--weapon--glaive')
					.appendToWhen(weaponType.truthy, icon)
			},
			filter (item, token) {
				return !item.categories?.length ? 'irrelevant'
					: item.categories.includes(weaponType.value?.hash ?? NaN)
			},
		}
	},
})

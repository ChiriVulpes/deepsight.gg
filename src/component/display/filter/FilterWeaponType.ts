import type { FilterToken } from 'component/display/Filter'
import Filter from 'component/display/Filter'
import { State } from 'kitsui'
import { ItemCategoryHashes } from 'node_modules/deepsight.gg/Enums'
import Relic from 'Relic'

const DeepsightWeaponTypeDefinition = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected
	return await conduit.definitions.en.DeepsightWeaponTypeDefinition.all()
})

const prefix = 'type:'

function getWeaponTypeDefinition (token: FilterToken) {
	const element = token.lowercase.slice(prefix.length).trim().trimQuotes()
	const matches = Object.values(DeepsightWeaponTypeDefinition.value ?? {})
		.filter(def => def?.displayProperties?.name.toLowerCase().startsWith(element))
	return matches.length === 1 ? matches[0] : undefined
}

export default Object.assign(
	Filter.Definition({
		id: 'type',
		type: 'or',
		collapsed: {
			hint: 'display-bar/filter/collapsed/type',
			applies: prefix,
		},
		suggestions: DeepsightWeaponTypeDefinition.mapManual(defs => {
			return Object.values(defs ?? {})
				.map(def => def?.displayProperties?.name)
				.filter(name => !!name)
				.map(name => `${prefix}${name.toLowerCase()}`)
		}),
		match (owner, token) {
			if (!token.lowercase.startsWith(prefix))
				return undefined

			const weaponType = DeepsightWeaponTypeDefinition.map(owner, () => getWeaponTypeDefinition(token))
			const [labelText, filterText] = token.displayText.split(':')
			return {
				fullText: weaponType.map(owner, def => !def ? token.lowercase : `${prefix}${def.displayProperties.name.toLowerCase()}`),
				isPartial: weaponType.falsy,
				chip (chip, token) {
					chip.labelText.set(`${labelText}:`)
					chip.text.set(filterText)
				},
				doubleWidthIcon: true,
				icon: {
					image: weaponType.map(owner, def => def && `https://www.bungie.net${def.displayProperties.icon}`),
					tweak: image => (image
						.style.bind(weaponType.map(image, def => def?.hash === ItemCategoryHashes.Bows), 'filter-display-chip-icon-image--type--bow')
						.style.bind(weaponType.map(image, def => def?.hash === ItemCategoryHashes.Glaives), 'filter-display-chip-icon-image--type--glaive')
					),
				},
				filter (item, token) {
					return !item.definition.categoryHashes?.length ? 'irrelevant'
						: item.definition.categoryHashes.includes(weaponType.value?.hash ?? NaN)
				},
			}
		},
	}),
	{
		getWeaponTypeDefinition,
	},
)

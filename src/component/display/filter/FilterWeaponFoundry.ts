import Image from 'component/core/Image'
import Filter from 'component/display/Filter'
import { FoundryHashes } from 'deepsight.gg/Enums'
import { State } from 'kitsui'
import DisplayProperties from 'model/DisplayProperties'
import Relic from 'Relic'

const DeepsightWeaponFoundryDefinition = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected
	return await conduit.definitions.en.DeepsightWeaponFoundryDefinition.all()
})

const prefix = 'foundry:'

export default Filter.Definition({
	id: 'foundry',
	type: 'or',
	suggestions: DeepsightWeaponFoundryDefinition.mapManual(defs => {
		return Object.values(defs ?? {})
			.map(def => def?.displayProperties?.name)
			.filter(name => !!name)
			.map(name => `${prefix}${name?.toLowerCase()}`)
	}),
	match (owner, token) {
		if (!token.lowercase.startsWith(prefix))
			return undefined

		const foundry = DeepsightWeaponFoundryDefinition.map(owner, DeepsightWeaponFoundryDefinition => {
			const element = token.lowercase.slice(prefix.length).trim().trimQuotes()
			const matches = Object.values(DeepsightWeaponFoundryDefinition ?? {})
				.filter(def => def?.displayProperties?.name?.toLowerCase().startsWith(element))
			return matches.length === 1 ? matches[0] : undefined
		})
		const [labelText, filterText] = token.displayText.split(':')
		return {
			fullText: foundry.map(owner, def => !def ? token.lowercase : `${prefix}${def.displayProperties.name?.toLowerCase()}`),
			isPartial: foundry.falsy,
			chip (chip, token) {
				chip.style('filter-display-chip--weapon-foundry')
				chip.labelText.set(`${labelText}:`)
				chip.text.set(filterText)
			},
			icon (icon, token) {
				Image(foundry.map(icon, def => def && DisplayProperties.icon(def.displayProperties.icon)))
					.style.bind(foundry.map(icon, def => def?.hash === FoundryHashes.SUROS), 'filter-display-chip-icon--foundry--suros')
					.style.bind(foundry.map(icon, def => def?.hash === FoundryHashes.Daito), 'filter-display-chip-icon--foundry--daito')
					.appendToWhen(foundry.truthy, icon)
			},
			filter (item, token) {
				return !item.foundryImage ? 'irrelevant'
					: item.foundryImage === foundry.value?.overlay
			},
		}
	},
})
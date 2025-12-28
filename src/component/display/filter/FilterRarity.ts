import Filter from 'component/display/Filter'
import { ItemTierTypeHashes, PresentationNodeHashes } from 'deepsight.gg/Enums'
import { State } from 'kitsui'
import Definitions from 'model/Definitions'
import Relic from 'Relic'

const EngramIcon = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected
	const engramDef = await conduit.definitions.en.DestinyPresentationNodeDefinition.get(PresentationNodeHashes.Engrams)
	return `https://www.bungie.net${engramDef?.displayProperties?.icon}`
})

const prefix = 'rarity:'

const excludedTierTypes = [
	ItemTierTypeHashes.BasicCurrency,
	ItemTierTypeHashes.BasicQuest,
	ItemTierTypeHashes.Invalid,
]

export default Filter.Definition({
	id: 'rarity',
	type: 'or',
	suggestions: Definitions.DeepsightTierTypeDefinition.mapManual(defs => {
		return Object.values(defs ?? {})
			.filter(def => !excludedTierTypes.includes(def.hash))
			.sort((a, b) => a.tierType - b.tierType)
			.map(def => def?.displayProperties?.name)
			.filter(name => !!name)
			.map(name => `${prefix}${name!.toLowerCase()}`)
	}),
	match (owner, token) {
		if (!token.lowercase.startsWith(prefix))
			return undefined

		const element = token.lowercase.slice(prefix.length).trim()
		const tierType = Definitions.DeepsightTierTypeDefinition.map(owner, defs => {
			const matches = Object.values(defs ?? {})
				.filter(def => def?.displayProperties?.name?.toLowerCase().startsWith(element))
			return matches.length === 1 ? matches[0] : undefined
		})
		const [labelText, filterText] = token.displayText.split(':')
		return {
			fullText: tierType.map(owner, def => !def ? token.lowercase : `${prefix}${def.displayProperties.name?.toLowerCase()}`),
			isPartial: tierType.falsy,
			chip (chip, token) {
				chip.style.bindFrom(tierType.map(chip, def => def && `filter-display-chip--rarity--${def.displayProperties.name?.toLowerCase()}` as 'filter-display-chip--element--arc'))
				chip.labelText.set(`${labelText}:`)
				chip.text.set(filterText)
			},
			icon: EngramIcon,
			filter (item, token) {
				return item.rarity === tierType.value?.hash
			},
		}
	},
})

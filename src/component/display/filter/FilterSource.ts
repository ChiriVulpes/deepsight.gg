import Filter from 'component/display/Filter'
import { State } from 'kitsui'
import DisplayProperties from 'model/DisplayProperties'
import Relic from 'Relic'

const defs = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected
	const [
		DeepsightItemSourceDefinition,
		DestinyEventCardDefinition,
		DeepsightStats,
	] = await Promise.all([
		conduit.definitions.en.DeepsightItemSourceDefinition.all(),
		conduit.definitions.en.DestinyEventCardDefinition.all(),
		conduit.definitions.en.DeepsightStats.all(),
	])

	return { DeepsightItemSourceDefinition, DestinyEventCardDefinition, DeepsightStats }
})

const prefix = 'source:'

export default Filter.Definition({
	id: 'source',
	type: 'or',
	collapsed: {
		hint: 'display-bar/filter/collapsed/source',
		applies: prefix,
	},
	suggestions: defs.mapManual(defs => {
		const { DeepsightItemSourceDefinition, DestinyEventCardDefinition, DeepsightStats } = defs ?? {}
		return Object.values(DeepsightItemSourceDefinition ?? {})
			.filter(def => false
				// sources that are not related to events
				|| !def.event
				// sources for current events
				|| DeepsightStats?.activeEvent === def.event
				// sources representing upcoming events
				|| new Date(DestinyEventCardDefinition?.[def.event]?.endTime ?? 0).getTime() > Date.now()
			)
			.map(def => def?.displayProperties?.name)
			.filter(name => !!name)
			.map(name => `${prefix}${name?.toLowerCase()}`)
	}),
	match (owner, token) {
		if (!token.lowercase.startsWith(prefix))
			return undefined

		const source = defs.map(owner, defs => {
			const element = token.lowercase.slice(prefix.length).trim().trimQuotes()
			const matches = Object.values(defs?.DeepsightItemSourceDefinition ?? {})
				.filter(def => def?.displayProperties?.name?.toLowerCase().startsWith(element))
			return element.length < 5 && matches.length > 1 ? undefined : matches[0]
		})
		const [labelText, filterText] = token.displayText.split(':')
		return {
			fullText: source.map(owner, def => !def ? token.lowercase : `${prefix}${def.displayProperties.name?.toLowerCase()}`),
			isPartial: false,
			chip (chip, token) {
				chip.labelText.set(`${labelText}:`)
				chip.text.set(filterText)
			},
			icon: source.map(owner, def => def && DisplayProperties.icon(def.displayProperties.icon)),
			filter (item, token) {
				return !item.sources?.some(source => source.type !== 'defined' || source.eventState !== 'unknown') ? 'irrelevant'
					: !source.value || !!item.sources.some(itemSource => itemSource.type === 'defined' && itemSource.id === source.value?.hash)
			},
		}
	},
})

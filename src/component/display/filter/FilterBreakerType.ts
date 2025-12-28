import Filter from 'component/display/Filter'
import { State } from 'kitsui'
import { NonNullish } from 'kitsui/utility/Arrays'
import Definitions from 'model/Definitions'

const defs = State.UseManual({
	DestinyBreakerTypeDefinition: Definitions.DestinyBreakerTypeDefinition,
	DeepsightBreakerTypeDefinition: Definitions.DeepsightBreakerTypeDefinition,
})

const prefix = 'stun:'

export default Filter.Definition({
	id: 'stun',
	type: 'or',
	suggestions: defs.mapManual(defs => {
		return [prefix].concat(Object.values(defs?.DestinyBreakerTypeDefinition ?? {})
			.filter(NonNullish)
			.map(def => def?.displayProperties?.name)
			.filter(name => !!name)
			.map(name => `${prefix}${name.toLowerCase()}`)
		)
	}),
	match (owner, token) {
		if (!token.lowercase.startsWith(prefix))
			return undefined

		const element = token.lowercase.slice(prefix.length).trim()
		const breakerType = defs.map(owner, defs => {
			const matches = Object.values(defs?.DestinyBreakerTypeDefinition ?? {})
				.filter(def => def?.displayProperties?.name.toLowerCase().startsWith(element))
			return matches.length === 1 ? matches[0] : undefined
		})
		const [labelText, filterText] = token.displayText.split(':')
		return {
			fullText: breakerType.map(owner, def => !def ? token.lowercase : `${prefix}${def.displayProperties.name.toLowerCase()}`),
			isPartial: false,
			chip (chip, token) {
				chip.labelText.set(`${labelText}:`)
				chip.text.set(filterText)
			},
			icon: breakerType.map(owner, def => def && `https://www.bungie.net${def.displayProperties.icon}`),
			filter (item, token) {
				const { DeepsightBreakerTypeDefinition } = defs.value ?? {}
				const types = [
					...DeepsightBreakerTypeDefinition?.[item.hash]?.types ?? [],
					...item.sockets.flatMap(s => s.plugs.flatMap(plugHash => DeepsightBreakerTypeDefinition?.[plugHash]?.types ?? [])),
				].distinct()
				return !types.length ? 'irrelevant'
					: !breakerType.value || types.includes(breakerType.value.hash)
			},
		}
	},
})

import Filter from 'component/display/Filter'
import FilterWeaponType from 'component/display/filter/FilterWeaponType'
import { State } from 'kitsui'
import { NonNullish } from 'kitsui/utility/Arrays'
import Relic from 'Relic'

const DeepsightWeaponFrameDefinition = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected
	return await conduit.definitions.en.DeepsightWeaponFrameDefinition.all()
})

const prefix = 'frame:'

export default Filter.Definition({
	id: 'frame',
	type: 'or',
	collapsed: (owner, currentFilter) => !currentFilter.some(filter => filter.id === FilterWeaponType.id) ? undefined : {
		hint: 'display-bar/filter/collapsed/frame',
		applies: prefix,
	},
	suggestions: (owner, currentFilter) => DeepsightWeaponFrameDefinition.map(owner, defs => {
		return Object.values(defs ?? {})
			.filter(def => currentFilter
				.map(filter => filter.id !== FilterWeaponType.id ? undefined : FilterWeaponType.getWeaponTypeDefinition(filter.token)?.hash)
				.filter(NonNullish)
				.some(weaponTypeHash => def.weaponTypes.includes(weaponTypeHash))
			)
			.map(def => def?.displayProperties?.name)
			.filter(name => !!name)
			.map(name => `${prefix}${name.toLowerCase()}`)
	}),
	match (owner, token) {
		if (!token.lowercase.startsWith(prefix))
			return undefined

		const element = token.lowercase.slice(prefix.length).trim().trimQuotes()
		const weaponFrameMatches = DeepsightWeaponFrameDefinition.map(owner, defs => {
			return Object.values(defs ?? {})
				.filter(def => def?.displayProperties?.name.toLowerCase().startsWith(element))
		})
		const weaponFrameName = weaponFrameMatches.map(owner, matches => {
			const matchNames = matches.map(def => `${prefix}${def.displayProperties.name.toLowerCase()}`).distinct()
			return matchNames.length === 1 ? matchNames[0] : undefined
		})
		const weaponFrameIcon = weaponFrameMatches.map(owner, matches => {
			return matches
				.map(def => `https://www.bungie.net${def.displayProperties.icon}`)
				.groupBy(icon => icon, instances => instances.length)
				.sort((a, b) => b[1] - a[1])
				.map(([icon]) => icon)
				.at(0)
		})
		const noWeaponFrameMatches = weaponFrameMatches.map(owner, matches => matches.length === 0)
		const [labelText, filterText] = token.displayText.split(':')
		return {
			fullText: weaponFrameName.map(owner, name => name ?? token.lowercase),
			isPartial: noWeaponFrameMatches,
			chip (chip, token) {
				chip.labelText.set(`${labelText}:`)
				chip.text.set(filterText)
			},
			icon: weaponFrameIcon,
			filter (item, token) {
				const plugs = item.definition.sockets?.flatMap(socket => socket.plugs) ?? []
				return !plugs?.length ? 'irrelevant'
					: weaponFrameMatches.value.some(match => plugs.includes(match.hash))
			},
		}
	},
})

import Image from 'component/core/Image'
import Filter from 'component/display/Filter'
import { State } from 'kitsui'
import Relic from 'Relic'

const DestinyDamageTypeDefinition = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected
	return await conduit.definitions.en.DestinyDamageTypeDefinition.all()
})

const prefix = 'element:'
export default Filter.Definition({
	id: 'element',
	match (owner, token) {
		if (!token.lowercase.startsWith(prefix))
			return undefined

		const element = token.lowercase.slice(prefix.length).trim()
		const damageType = DestinyDamageTypeDefinition.map(owner, defs => Object.values(defs ?? {})
			.find(def => def?.displayProperties?.name.toLowerCase() === element)
		)
		return {
			icon (icon, token) {
				Image(damageType.map(icon, def => def && `https://www.bungie.net${def.displayProperties.icon}`))
					.appendTo(icon)
			},
			filter (item, token) {
				return !item.damageTypes?.length || item.damageTypes.includes(damageType.value?.hash ?? NaN)
			},
		}
	},
})

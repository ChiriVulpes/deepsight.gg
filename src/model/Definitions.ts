import type { AllComponentNames, DefinitionsForComponentName } from 'conduit.deepsight.gg/DefinitionComponents'
import { State } from 'kitsui'
import Relic from 'Relic'

type Definitions = { [COMPONENT in AllComponentNames]: State.Async<DefinitionsForComponentName<COMPONENT>> }
export default new Proxy({} as Definitions, {
	get: <PROP extends AllComponentNames> (target: Definitions, prop: PROP) => {
		if (target[prop])
			return target[prop]

		const state = State.Async(State.Owner.create(), async () => {
			const conduit = await Relic.connected
			return await conduit.definitions.en[prop].all() as never
		})
		return target[prop] = state as never
	},
})

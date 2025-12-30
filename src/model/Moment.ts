import { State } from 'kitsui'
import type { ItemStateOptional } from 'model/Items'
import type { MomentHashes } from 'node_modules/deepsight.gg/Enums'
import { DeepsightMomentDefinition } from 'node_modules/deepsight.gg/Interfaces'

const DeepsightMomentDefinition = State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await import('Relic').then(m => m.default.connected)
	return conduit.definitions.en.DeepsightMomentDefinition.all()
})

namespace Moment {
	export function resolve (owner: State.Owner, momentHash?: State.Or<MomentHashes | undefined>): State<DeepsightMomentDefinition | undefined> {
		return State.Map(owner, [State.get(momentHash), DeepsightMomentDefinition], (momentHash, DeepsightMomentDefinition): DeepsightMomentDefinition | undefined => DeepsightMomentDefinition?.[momentHash!])
	}
	export function fromItemState (owner: State.Owner, itemState?: State.Or<ItemStateOptional | undefined>): State<DeepsightMomentDefinition | undefined> {
		return State.Map(owner, [State.get(itemState), DeepsightMomentDefinition], (itemState, DeepsightMomentDefinition): DeepsightMomentDefinition | undefined => DeepsightMomentDefinition?.[itemState?.definition?.momentHash!])
	}
}

export default Moment

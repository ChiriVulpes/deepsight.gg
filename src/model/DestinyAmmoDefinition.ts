import { DestinyAmmunitionType } from 'bungie-api-ts/destiny2'
import { PresentationNodeHashes } from 'deepsight.gg/Enums'
import { State } from 'kitsui'
import Relic from 'Relic'

export default State.Async(State.Owner.create(), async (signal, setProgress) => {
	const conduit = await Relic.connected

	const ammoTypes = [
		[DestinyAmmunitionType.Primary, PresentationNodeHashes.Primary1731162900],
		[DestinyAmmunitionType.Special, PresentationNodeHashes.Special_Scope0],
		[DestinyAmmunitionType.Heavy, PresentationNodeHashes.Heavy3253265639],
	]

	const nodes = await Promise.all(ammoTypes
		.map(([, nodeHash]) => conduit.definitions.en.DestinyPresentationNodeDefinition.get(nodeHash))
	)

	return nodes.map(node => node && {
		displayProperties: node?.displayProperties,
		hash: ammoTypes.find(([, nodeHash]) => nodeHash === node.hash)?.[0] ?? DestinyAmmunitionType.None,
	})
})

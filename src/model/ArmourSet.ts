import type Collections from 'conduit.deepsight.gg/Collections'
import type { Item } from 'conduit.deepsight.gg/Collections'
import { State } from 'kitsui'
import type { DestinySandboxPerkDefinition } from 'node_modules/bungie-api-ts/destiny2'
import type { SandboxPerkHashes } from 'node_modules/deepsight.gg/Enums'

export default function ArmourSet (owner: State.Owner, item: State<Item | undefined>, collections: State.Or<Collections>) {
	collections = State.get(collections)
	return State.Map(owner, [item, collections], (item, collections) => {
		const definition = item && collections.itemSets[item.itemSetHash!]
		interface Perk {
			requiredSetCount: number
			definition: DestinySandboxPerkDefinition
		}
		const perks = definition?.setPerks
			.sort((a, b) => a.requiredSetCount - b.requiredSetCount)
			.map(perk => ({ requiredSetCount: perk.requiredSetCount, definition: collections.perks[perk.sandboxPerkHash as SandboxPerkHashes] }))
			.filter((perk): perk is Perk => !!perk.definition)
		return !definition ? undefined : {
			definition,
			perks: perks!,
		}
	})
}

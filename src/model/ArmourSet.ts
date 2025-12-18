import type { DestinySandboxPerkDefinition } from 'bungie-api-ts/destiny2'
import type Collections from 'conduit.deepsight.gg/item/Collections'
import type { Item } from 'conduit.deepsight.gg/item/Item'
import type { SandboxPerkHashes } from 'deepsight.gg/Enums'
import { State } from 'kitsui'

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

import type { DestinySandboxPerkDefinition } from 'bungie-api-ts/destiny2'
import type { SandboxPerkHashes } from 'deepsight.gg/Enums'
import type { State } from 'kitsui'
import type { ItemStateOptional } from 'model/Item'

export default function ArmourSet (owner: State.Owner, state: State<ItemStateOptional>) {
	return state.map(owner, ({ definition: item, collections }) => {
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
			perks: perks ?? [],
		}
	})
}

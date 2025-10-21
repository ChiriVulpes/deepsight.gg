import DataComponentHelper from 'component/view/data/DataComponentHelper'
import type { DestinyInventoryItemDefinition } from 'node_modules/bungie-api-ts/destiny2'

export default DataComponentHelper<DestinyInventoryItemDefinition>({
	getSubtitle (definition) {
		return definition.itemTypeAndTierDisplayName
	},
})

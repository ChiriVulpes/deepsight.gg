import DataComponentHelper from 'component/view/data/DataComponentHelper'
import type { DestinyInventoryItemDefinition } from 'node_modules/bungie-api-ts/destiny2'
import { ItemCategoryHashes } from 'node_modules/deepsight.gg/Enums'

export default DataComponentHelper<DestinyInventoryItemDefinition>({
	getSubtitle (definition) {
		if (definition.itemCategoryHashes?.includes(ItemCategoryHashes.Patterns))
			return quilt => quilt['view/data/component/item/pattern'](definition.itemTypeDisplayName)

		if (definition.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies))
			return quilt => quilt['view/data/component/item/dummy'](definition.itemTypeDisplayName)

		return definition.itemTypeAndTierDisplayName
	},
})

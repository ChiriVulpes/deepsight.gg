import { itemStateHas } from 'component/display/sort/definition/ItemSortHelpers'
import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'
import { ItemState as InventoryItemState } from 'bungie-api-ts/destiny2'

export default Sort.Definition({
	id: 'masterwork',
	label: quilt => quilt['display-bar/sort/masterwork/title'](),
	shortLabel: quilt => quilt['display-bar/sort/masterwork/short'](),
	compare: (a, b) => SortDefinitionCompare.compareBoolean(
		itemStateHas(InventoryItemState.Masterwork, b.instance?.state),
		itemStateHas(InventoryItemState.Masterwork, a.instance?.state),
	),
})

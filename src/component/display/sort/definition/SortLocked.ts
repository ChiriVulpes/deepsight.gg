import { itemStateHas } from 'component/display/sort/definition/ItemSortHelpers'
import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'
import { ItemState as InventoryItemState } from 'bungie-api-ts/destiny2'

export default Sort.Definition({
	id: 'locked',
	label: quilt => quilt['display-bar/sort/locked/title'](),
	shortLabel: quilt => quilt['display-bar/sort/locked/short'](),
	compare: (a, b) => SortDefinitionCompare.compareBoolean(
		itemStateHas(InventoryItemState.Locked, b.instance?.state),
		itemStateHas(InventoryItemState.Locked, a.instance?.state),
	),
})

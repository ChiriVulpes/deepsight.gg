import { sourceKey } from 'component/display/sort/definition/ItemSortHelpers'
import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'

export default Sort.Definition({
	id: 'source',
	label: quilt => quilt['display-bar/sort/source/title'](),
	shortLabel: quilt => quilt['display-bar/sort/source/short'](),
	compare: (a, b) => SortDefinitionCompare.compareString(sourceKey(a.definition?.sources), sourceKey(b.definition?.sources)),
})

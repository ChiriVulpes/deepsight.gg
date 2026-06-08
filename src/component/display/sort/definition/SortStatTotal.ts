import { sumStats } from 'component/display/sort/definition/ItemSortHelpers'
import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'

export default Sort.Definition({
	id: 'stat-total',
	label: quilt => quilt['display-bar/sort/stat-total/title'](),
	shortLabel: quilt => quilt['display-bar/sort/stat-total/short'](),
	compare: (a, b) => SortDefinitionCompare.compareNumber(sumStats(b.definition?.stats), sumStats(a.definition?.stats)),
})

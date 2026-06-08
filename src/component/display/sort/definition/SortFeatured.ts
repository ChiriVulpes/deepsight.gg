import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'

export default Sort.Definition({
	id: 'featured',
	label: quilt => quilt['display-bar/sort/featured/title'](),
	shortLabel: quilt => quilt['display-bar/sort/featured/short'](),
	compare: (a, b) => SortDefinitionCompare.compareBoolean(b.definition?.featured, a.definition?.featured),
})

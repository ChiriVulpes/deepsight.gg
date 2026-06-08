import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'

export default Sort.Definition({
	id: 'moment',
	label: quilt => quilt['display-bar/sort/moment/title'](),
	shortLabel: quilt => quilt['display-bar/sort/moment/short'](),
	compare: (a, b) => SortDefinitionCompare.compareNumber(b.definition?.momentHash, a.definition?.momentHash),
})

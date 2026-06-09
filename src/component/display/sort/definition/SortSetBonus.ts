import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'

export default Sort.Definition({
	id: 'setbonus',
	label: quilt => quilt['display-bar/sort/setbonus/title'](),
	shortLabel: quilt => quilt['display-bar/sort/setbonus/short'](),
	compare: (a, b) => SortDefinitionCompare.compareNumber(b.definition?.itemSetHash, a.definition?.itemSetHash),
})

import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'

export default Sort.Definition({
	id: 'name',
	label: quilt => quilt['display-bar/sort/name/title'](),
	shortLabel: quilt => quilt['display-bar/sort/name/short'](),
	compare: (a, b) => SortDefinitionCompare.compareString(a.definition?.displayProperties.name, b.definition?.displayProperties.name),
})

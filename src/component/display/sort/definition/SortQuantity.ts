import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'

export default Sort.Definition({
	id: 'quantity',
	label: quilt => quilt['display-bar/sort/quantity/title'](),
	shortLabel: quilt => quilt['display-bar/sort/quantity/short'](),
	compare: (a, b) => SortDefinitionCompare.compareNumber(b.instance?.quantity, a.instance?.quantity),
})

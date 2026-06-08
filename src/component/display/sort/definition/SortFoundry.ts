import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'

export default Sort.Definition({
	id: 'foundry',
	label: quilt => quilt['display-bar/sort/foundry/title'](),
	shortLabel: quilt => quilt['display-bar/sort/foundry/short'](),
	compare: (a, b) => SortDefinitionCompare.compareNumber(a.definition?.foundryHash, b.definition?.foundryHash),
})

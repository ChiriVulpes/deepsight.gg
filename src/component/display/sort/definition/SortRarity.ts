import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'

export default Sort.Definition({
	id: 'rarity',
	label: quilt => quilt['display-bar/sort/rarity/title'](),
	shortLabel: quilt => quilt['display-bar/sort/rarity/short'](),
	compare: (a, b) => SortDefinitionCompare.compareNumber(a.definition?.rarity, b.definition?.rarity),
})

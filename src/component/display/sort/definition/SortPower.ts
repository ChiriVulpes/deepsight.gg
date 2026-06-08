import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'
import { StatHashes } from 'deepsight.gg/Enums'

export default Sort.Definition({
	id: 'power',
	label: quilt => quilt['display-bar/sort/power/title'](),
	shortLabel: quilt => quilt['display-bar/sort/power/short'](),
	compare: (a, b) => SortDefinitionCompare.compareNumber(b.definition?.stats?.[StatHashes.Power]?.value, a.definition?.stats?.[StatHashes.Power]?.value),
})

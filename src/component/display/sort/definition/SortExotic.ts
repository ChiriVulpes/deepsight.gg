import { isExotic } from 'component/display/sort/definition/ItemSortHelpers'
import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'

export default Sort.Definition({
	id: 'exotic',
	label: quilt => quilt['display-bar/sort/exotic/title'](),
	shortLabel: quilt => quilt['display-bar/sort/exotic/short'](),
	compare: (a, b) => 0
		|| SortDefinitionCompare.compareBoolean(isExotic(b), isExotic(a))
		|| (isExotic(a) && isExotic(b) ? SortDefinitionCompare.compareString(a.definition?.displayProperties.name, b.definition?.displayProperties.name) : 0),
})

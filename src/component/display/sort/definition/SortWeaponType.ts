import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'

export default Sort.Definition({
	id: 'type',
	label: quilt => quilt['display-bar/sort/weapon-type/title'](),
	shortLabel: quilt => quilt['display-bar/sort/weapon-type/short'](),
	icon: {
		image: '/static/svg/weapon/hand_cannon.svg',
	},
	compare: (a, b) => SortDefinitionCompare.compareString(a.definition?.type, b.definition?.type),
})

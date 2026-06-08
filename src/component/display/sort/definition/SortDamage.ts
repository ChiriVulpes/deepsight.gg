import { bungieIcon } from 'component/display/sort/definition/ItemSortHelpers'
import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'
import { DamageTypeHashes } from 'deepsight.gg/Enums'
import Definitions from 'model/Definitions'

const kineticDamageIcon = Definitions.DestinyDamageTypeDefinition.mapManual(defs =>
	bungieIcon(defs?.[DamageTypeHashes.Kinetic]?.displayProperties.icon)
)
const kineticDamageIconFallback = 'https://www.bungie.net/common/destiny2_content/icons/DestinyDamageTypeDefinition_3385a924fd3ccb92c343ade19f19a370.png'

export default Sort.Definition({
	id: 'damage',
	label: quilt => quilt['display-bar/sort/damage/title'](),
	shortLabel: quilt => quilt['display-bar/sort/damage/short'](),
	icon: {
		image: kineticDamageIcon.coalesce(kineticDamageIconFallback),
	},
	compare: (a, b) => SortDefinitionCompare.compareNumber(b.definition?.damageTypeHashes?.[0], a.definition?.damageTypeHashes?.[0]),
})

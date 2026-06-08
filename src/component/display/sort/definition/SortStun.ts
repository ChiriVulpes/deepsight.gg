import { breakerKey, bungieIcon } from 'component/display/sort/definition/ItemSortHelpers'
import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'
import { BreakerTypeHashes } from 'deepsight.gg/Enums'
import Definitions from 'model/Definitions'

const shieldPiercingIcon = Definitions.DestinyBreakerTypeDefinition.mapManual(defs =>
	bungieIcon(Object.values(defs ?? {}).find(def => def?.hash === BreakerTypeHashes.ShieldPiercing)?.displayProperties.icon)
)

export default Sort.Definition({
	id: 'stun',
	label: quilt => quilt['display-bar/sort/stun/title'](),
	shortLabel: quilt => quilt['display-bar/sort/stun/short'](),
	icon: {
		image: shieldPiercingIcon,
	},
	compare: (a, b) => SortDefinitionCompare.compareNumber(breakerKey(a), breakerKey(b)),
})

import { bungieIcon } from 'component/display/sort/definition/ItemSortHelpers'
import { Sort, SortDefinitionCompare } from 'component/display/sort/SortDefinition'
import { DestinyAmmunitionType } from 'bungie-api-ts/destiny2'
import DestinyAmmoDefinition from 'model/DestinyAmmoDefinition'

const primaryAmmoIcon = DestinyAmmoDefinition.mapManual(defs =>
	bungieIcon(defs?.find(def => def?.hash === DestinyAmmunitionType.Primary)?.displayProperties.icon)
)
const primaryAmmoIconFallback = 'https://www.bungie.net/img/destiny_content/ammo_types/primary.png'

export default Sort.Definition({
	id: 'ammo',
	label: quilt => quilt['display-bar/sort/ammo/title'](),
	shortLabel: quilt => quilt['display-bar/sort/ammo/short'](),
	icon: {
		image: primaryAmmoIcon.coalesce(primaryAmmoIconFallback),
	},
	compare: (a, b) => SortDefinitionCompare.compareNumber(a.definition?.ammoType, b.definition?.ammoType),
})

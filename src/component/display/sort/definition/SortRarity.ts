import { Sort } from 'component/display/sort/SortDefinition'
import { ItemTierTypeHashes } from 'deepsight.gg/Enums'

const rarityOrder = [
	ItemTierTypeHashes.Invalid,
	ItemTierTypeHashes.BasicCurrency,
	ItemTierTypeHashes.BasicQuest,
	ItemTierTypeHashes.Common,
	ItemTierTypeHashes.Uncommon,
	ItemTierTypeHashes.Rare,
	ItemTierTypeHashes.Legendary,
	ItemTierTypeHashes.Exotic,
]

export default Sort.Definition({
	id: 'rarity',
	label: quilt => quilt['display-bar/sort/rarity/title'](),
	shortLabel: quilt => quilt['display-bar/sort/rarity/short'](),
	compare: (a, b) => rarityOrder.indexOf(b.definition?.rarity!) - rarityOrder.indexOf(a.definition?.rarity!),
})

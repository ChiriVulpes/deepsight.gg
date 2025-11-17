import ClarityDescriptions from 'component/view/data/component/ClarityDescriptions'
import DestinyInventoryItemDefinition from 'component/view/data/component/DestinyInventoryItemDefinition'
import DestinyLocationDefinition from 'component/view/data/component/DestinyLocationDefinition'
import type DataComponentHelper from 'component/view/data/DataComponentHelper'
import type { AllComponentNames } from 'conduit.deepsight.gg/DefinitionComponents'

export default {
	DestinyInventoryItemDefinition,
	DestinyLocationDefinition,
	ClarityDescriptions,
} as Partial<Record<AllComponentNames, DataComponentHelper<any>>>

import DataComponentHelper from 'component/view/data/DataComponentHelper'
import type { ClarityDescription } from 'conduit.deepsight.gg/Clarity'

export default DataComponentHelper<ClarityDescription>({
	getName (definition) {
		return definition.name
	},
	getSubtitle (definition) {
		return definition.type
	},
})

import DataComponentHelper from 'component/view/data/DataComponentHelper'
import type { DestinyDisplayPropertiesDefinition, DestinyLocationDefinition } from 'node_modules/bungie-api-ts/destiny2'

export default DataComponentHelper<DestinyLocationDefinition>({
	getName (definition) {
		const singleName = getSingleDisplayProperties(definition)?.name
		if (singleName)
			return singleName

		const names = getDisplayProperties(definition).map(display => display.name)
		return !names.length ? undefined : quilt => quilt['view/data/component/shared/multi'](names[0])
	},
	getDescription (definition) {
		return getSingleDisplayProperties(definition)?.description
	},
	getIcon (definition) {
		return getDisplayProperties(definition).at(0)?.icon
	},
})

function getDisplayProperties (definition: DestinyLocationDefinition): DestinyDisplayPropertiesDefinition[] {
	return !definition.locationReleases ? [] : definition.locationReleases
		.filter(loc => loc.displayProperties.name)
		.map(loc => loc.displayProperties)
		.distinct(display => `name:${display.name} desc:${display.description} icon:${display.icon}`)
}

function getSingleDisplayProperties (definition: DestinyLocationDefinition): DestinyDisplayPropertiesDefinition | undefined {
	const displays = getDisplayProperties(definition)
	return displays.length === 1 ? displays[0] : undefined
}

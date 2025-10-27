import DataHelperRegistry from 'component/view/data/DataHelperRegistry'
import type { AllComponentNames } from 'conduit.deepsight.gg/DefinitionComponents'
import type { DestinyDisplayPropertiesDefinition } from 'node_modules/bungie-api-ts/destiny2'
import type { DeepsightDisplayPropertiesDefinition } from 'node_modules/deepsight.gg/Interfaces'
import { _ } from 'utility/Objects'

namespace DataHelper {
	export function getComponentName (component: AllComponentNames): string
	export function getComponentName (component?: AllComponentNames): string | undefined
	export function getComponentName (component?: AllComponentNames) {
		return component
			?.replace(/([A-Z])/g, ' $1')
			.trimStart()
			.replace(' ', ': ')
			.replace('Definition', '')
	}

	export function display (definition?: object | null) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		return (definition as any)?.['displayProperties'] as Partial<DestinyDisplayPropertiesDefinition> & Partial<DeepsightDisplayPropertiesDefinition> | undefined
	}

	export function get (component?: AllComponentNames | null) {
		return component ? DataHelperRegistry[component] : undefined
	}

	export function getIcon (component?: AllComponentNames, definition?: object | null): string | undefined {
		if (definition) {
			const icon = _
				?? get(component)?.getIcon?.(definition)
				?? display(definition)?.icon

			if (icon && icon.startsWith('/'))
				return `https://www.bungie.net${icon}`
			if (icon && icon.startsWith('./'))
				return `https://deepsight.gg${icon.slice(1)}`
		}

		return 'https://www.bungie.net/img/destiny_content/collections/undiscovered.png'
	}

	export function getTitle (component?: AllComponentNames, definition?: object): string {
		return _
			|| get(component)?.getName?.(definition)
			|| display(definition)?.name
			|| 'No name'
	}

	export function getSubtitle (component?: AllComponentNames, definition?: object): string | undefined {
		return _
			|| get(component)?.getSubtitle?.(definition)
			|| display(definition)?.subtitle
			|| getComponentName(component)
	}
}

export default DataHelper

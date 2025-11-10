import type { DestinyDisplayPropertiesDefinition } from 'bungie-api-ts/destiny2'
import DataHelperRegistry from 'component/view/data/DataHelperRegistry'
import type { AllComponentNames } from 'conduit.deepsight.gg/DefinitionComponents'
import type { DeepsightDisplayPropertiesDefinition } from 'deepsight.gg/Interfaces'
import { _ } from 'utility/Objects'

namespace DataHelper {

	export const FALLBACK_ICON = 'https://www.bungie.net/img/destiny_content/collections/undiscovered.png'
	const MISSING_ICON = 'https://www.bungie.net/img/misc/missing_icon_d2.png'

	export function getComponentName (component: AllComponentNames, short?: true): string
	export function getComponentName (component?: AllComponentNames, short?: true): string | undefined
	export function getComponentName (component?: AllComponentNames, short?: true) {
		const result = component
			?.replace(/([A-Z])/g, ' $1')
			.trimStart()
			.replace(' ', ': ')
			.replace('Definition', '')
		return short ? result?.split(': ')[1] : result
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

			if (icon && MISSING_ICON.endsWith(icon))
				return FALLBACK_ICON

			if (icon)
				return DataHelper.resolveImagePath(icon, component) ?? FALLBACK_ICON
		}

		return FALLBACK_ICON
	}

	export function resolveImagePath (url: string, component?: AllComponentNames): string | undefined {
		if (component?.startsWith('Destiny'))
			return url.startsWith('/') ? `https://www.bungie.net${url}`
				: url.startsWith('./') ? `https://www.bungie.net${url.slice(1)}`
					: url.startsWith('http') ? url
						: undefined

		if (!component || component?.startsWith('Deepsight'))
			return url.startsWith('/') ? `https://www.bungie.net${url}`
				: url.startsWith('./') ? `https://deepsight.gg${url.slice(1)}`
					: url.startsWith('http') ? url
						: undefined

		console.warn(`Unable to resolve image path for URL "${url}" and component "${component}"`)
		return undefined
	}

	export function getComponentProvider (component?: AllComponentNames): string | undefined {
		return component
			?.replace(/([A-Z])/g, ' $1')
			.trimStart()
			.split(' ')
			.at(0)
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

import type { DestinyDisplayPropertiesDefinition } from 'bungie-api-ts/destiny2'
import RelativeTime from 'component/core/RelativeTime'
import DataHelperRegistry from 'component/view/data/DataHelperRegistry'
import type { DeepsightDisplayPropertiesDefinition } from 'deepsight.gg/Interfaces'
import { Component } from 'kitsui'
import type ComponentInsertionTransaction from 'kitsui/ext/ComponentInsertionTransaction'
import type { StringApplicatorSource } from 'kitsui/utility/StringApplicator'
import { _ } from 'utility/Objects'
import Time from 'utility/Time'
import { DATA_PRESENTATION } from './DataPresentation'
import type { WithDataPresentation } from './DataPresentation'
import type { DataTableName } from './DataTable'
import { isComponentTableName } from './DataTable'

namespace DataHelper {

	export interface RichContent {
		render (): Component | Component[] | undefined
	}

	export type Content = StringApplicatorSource | RichContent

	export const FALLBACK_ICON = 'https://www.bungie.net/img/destiny_content/collections/undiscovered.png'
	const MISSING_ICON = 'https://www.bungie.net/img/misc/missing_icon_d2.png'

	export function getComponentName (component: DataTableName, short?: true): string
	export function getComponentName (component?: DataTableName, short?: true): string | undefined
	export function getComponentName (component?: DataTableName, short?: true) {
		if (component === 'profiles')
			return 'Profiles'
		if (component === 'pgcrs')
			return 'PGCRs'

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

	export function get (component?: DataTableName | null) {
		return component && isComponentTableName(component) ? DataHelperRegistry[component] : undefined
	}

	export function getIcon (component?: DataTableName, definition?: object | null): string | undefined {
		if (component === 'pgcrs') {
			const icon = getPresentation(definition)?.pgcr?.activityIcon
			if (icon)
				return DataHelper.resolveImagePath(icon, 'DestinyActivityDefinition') ?? FALLBACK_ICON
		}

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

	export function resolveImagePath (url: string, component?: DataTableName): string | undefined {
		if (component?.startsWith('Destiny'))
			return url.startsWith('/') ? `https://www.bungie.net${url}`
				: url.startsWith('./') ? `https://www.bungie.net${url.slice(1)}`
					: url.startsWith('http') ? url
						: undefined

		if (!component || component?.startsWith('Deepsight'))
			return url.startsWith('/image/') || url.startsWith('/static/') ? `https://deepsight.gg${url}`
				: url.startsWith('/') ? `https://www.bungie.net${url}`
				: url.startsWith('./') ? `https://deepsight.gg${url.slice(1)}`
					: url.startsWith('http') ? url
						: undefined

		console.warn(`Unable to resolve image path for URL "${url}" and component "${component}"`)
		return undefined
	}

	export function getComponentProvider (component?: DataTableName): string | undefined {
		if (component === 'profiles' || component === 'pgcrs')
			return 'Deepsight'

		return component
			?.replace(/([A-Z])/g, ' $1')
			.trimStart()
			.split(' ')
			.at(0)
	}

	export function getTitle (component?: DataTableName, definition?: object): Content {
		if (component === 'profiles' && definition && 'name' in definition) {
			const profile = definition as { name: string, code?: number | string }
			return `${profile.name}${profile.code === undefined ? '' : `#${profile.code}`}`
		}
		if (component === 'pgcrs' && definition) {
			const presentation = getPresentation(definition)?.pgcr
			const pgcr = definition as { hash?: number | string }
			const name = presentation?.activityName ?? (pgcr.hash === undefined ? 'PGCR' : `PGCR ${pgcr.hash}`)
			return {
				render: () => [
					Component().text.set(name),
					...(presentation?.durationSeconds === undefined ? [] : [
						Component().text.set(' / '),
						Component().text.set(Time.compactDuration(presentation.durationSeconds)),
					]),
				],
			}
		}

		return _
			|| get(component)?.getName?.(definition)
			|| display(definition)?.name
			|| 'No name'
	}

	export function getSubtitle (component?: DataTableName, definition?: object): Content | undefined {
		if (component === 'profiles' && definition && 'clan' in definition && definition.clan && typeof definition.clan === 'object' && 'name' in definition.clan) {
			const clan = definition.clan as { name: string }
			return clan.name
		}
		if (component === 'pgcrs' && definition && 'pgcrStatus' in definition) {
			const presentation = getPresentation(definition)?.pgcr
			const pgcr = definition as { pgcrStatus: string }
			return presentation?.period ? { render: () => RelativeTime(presentation.period) } : pgcr.pgcrStatus
		}

		return _
			|| get(component)?.getSubtitle?.(definition)
			|| display(definition)?.subtitle
			|| getComponentName(component)
	}

	export function renderContent (into: ComponentInsertionTransaction, content: Content | undefined) {
		if (!content)
			return

		if (isRichContent(content)) {
			const rendered = content.render()
			for (const component of Array.isArray(rendered) ? rendered : [rendered])
				component?.appendTo(into)
			return
		}

		Component()
			.text.set(content)
			.appendTo(into)
	}

	export function getTitleText (component?: DataTableName, definition?: object): StringApplicatorSource {
		const title = getTitle(component, definition)
		if (!isRichContent(title))
			return title

		if (component === 'pgcrs')
			return getPresentation(definition)?.pgcr?.activityName ?? 'PGCR'

		return getComponentName(component) ?? 'No name'
	}

	function isRichContent (content: Content): content is RichContent {
		return typeof content === 'object' && 'render' in content
	}

	function getPresentation (definition?: object | null) {
		return (definition as WithDataPresentation<object> | undefined)?.[DATA_PRESENTATION]
	}
}

export default DataHelper

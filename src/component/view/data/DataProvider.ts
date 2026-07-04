import type { DataTableName } from 'component/view/data/DataTable'
import { isVirtualTableName } from 'component/view/data/DataTable'
import DataVirtualTables from 'component/view/data/DataVirtualTables'
import type { AllComponentNames, DefinitionReferencesPage, DefinitionsImagePage, DefinitionsPage, DefinitionWithLinks } from 'conduit.deepsight.gg/DefinitionComponents'
import type { DefinitionsFilter } from 'conduit.deepsight.gg/Definitions'
import { DeepsightImageCategory } from 'deepsight.gg/Interfaces'
import { State } from 'kitsui'
import Relic from 'Relic'
import Arrays from 'utility/Arrays'
import { _ } from 'utility/Objects'

export namespace DeepsightImageCategories {

	export const map: Record<DeepsightImageCategory, string> = {
		[DeepsightImageCategory.PgcrImage]: 'pgcrimage',
		[DeepsightImageCategory.Iconography]: 'iconography',
		[DeepsightImageCategory.Icon]: 'icon',
		[DeepsightImageCategory.Screenshot]: 'screenshot',
		[DeepsightImageCategory.Watermark]: 'watermark',
		[DeepsightImageCategory.Placeholder]: 'placeholder',
	}

	export const aliases: string[] = [] // Object.values(map)
	export const categories = /* Object.keys(map).map(Number)*/[] as DeepsightImageCategory[]

	export function fromAlias (alias: string): DeepsightImageCategory | undefined {
		alias = alias.toLowerCase()
		return +Object.entries(map).find(([_, value]) => value === alias)?.at(0)!
			|| undefined
	}
}

declare module 'conduit.deepsight.gg/Definitions' {
	export interface DefinitionsFilter<DEFINITION> {
		componentNameContains?: string[]
		imageCategories?: DeepsightImageCategory[]
	}
}

type DataProviderParam = number | string | boolean
interface DataProvider<PARAMS extends DataProviderParam[], T> {
	prep (...params: PARAMS): void
	get (...params: PARAMS): State.Async<T | undefined>
	clear (): void
}

interface DataProviderDefinition<PARAMS extends DataProviderParam[], T> {
	provider: State.AsyncMapGenerator<PARAMS, T | undefined>
	cacheSize: number
	prepCacheSize: number
	equals?: (a: PARAMS, b: PARAMS) => boolean
}

function DataProvider<PARAMS extends DataProviderParam[], T> (definition: DataProviderDefinition<PARAMS, T>): DataProvider<PARAMS, T> {
	interface CachedData {
		params: PARAMS
		data: State.Async<T | undefined>
	}

	const cachedData: CachedData[] = []
	const prepCache: CachedData[] = []

	function getInternal (...params: PARAMS): CachedData {
		return {
			params,
			data: State.Async(State.Owner.create(), async (signal, setProgress) => {
				return await definition.provider(params, signal, setProgress)
			}),
		}
	}

	const equals = definition.equals ?? ((a: PARAMS, b: PARAMS) => {
		if (a.length !== b.length)
			return false

		return a.every((param, index) => param === b[index])
	})

	return {
		prep (...params: PARAMS): void {
			let cached = _
				?? cachedData.find(item => equals(item.params, params))
				?? prepCache.find(item => equals(item.params, params))
			if (cached)
				return

			cached = getInternal(...params)
			prepCache.push(cached)

			if (prepCache.length > 200)
				prepCache.shift()
		},
		get (...params: PARAMS): State.Async<T | undefined> {
			let cached = cachedData.find(item => equals(item.params, params))
			if (cached)
				return cached.data

			const prepCacheIndex = prepCache.findIndex(item => equals(item.params, params))
			if (prepCacheIndex !== -1) {
				cached = prepCache[prepCacheIndex]
				// Move from prepCache to cachedData
				prepCache.splice(prepCacheIndex, 1)
				cachedData.push(cached)
				return cached.data
			}

			cached = getInternal(...params)
			cachedData.push(cached)

			if (cachedData.length > 20)
				cachedData.shift()

			return cached.data
		},
		clear () {
			cachedData.length = 0
			prepCache.length = 0
		},
	}
}

namespace DataProvider {

	export const SINGLE = DataProvider<[component: DataTableName, hash: number | string], DefinitionWithLinks<object>>({
		provider: async ([component, hash], signal, setProgress) => {
			if (isVirtualTableName(component))
				return await DataVirtualTables.getWithLinks(component, hash)

			const conduit = await Relic.connected
			if (signal.aborted)
				return undefined

			const result = await conduit.definitions.en[component as Exclude<AllComponentNames, 'DeepsightStats'>].getWithLinks(hash)
			if (!result || signal.aborted)
				return undefined

			return result
		},
		cacheSize: 20,
		prepCacheSize: 200,
		equals: ([aComponent, aHash], [bComponent, bHash]) => {
			return aComponent === bComponent && `${aHash}` === `${bHash}`
		},
	})

	export const FULL = DataProvider<[component: DataTableName, filtersKey: string, singleDefComponent: boolean], DefinitionWithLinks<object>>({
		provider: async ([component, filtersKey, singleDefComponent], signal, setProgress) => {
			const filters = !filtersKey ? undefined : JSON.parse(filtersKey) as DefinitionsFilter<object>
			if (isVirtualTableName(component))
				return await DataVirtualTables.full(component, filters)

			const conduit = await Relic.connected
			if (signal.aborted)
				return undefined

			const defs = await conduit.definitions.en[component as Exclude<AllComponentNames, 'DeepsightStats'>].all(filters as never)
			if (signal.aborted)
				return undefined

			const keys = Object.keys(defs)
			const key = keys[0] as keyof typeof defs
			const definition = !singleDefComponent || keys.length > 1 || typeof defs[key] !== 'object' || !defs[key]
				? defs
				: defs[key] as object
			return { definition }
		},
		cacheSize: 5,
		prepCacheSize: 5,
	})

	export const createPaged = (filters?: DefinitionsFilter<object> | string, includeImageFilters = false) => {
		const filtersObj = typeof filters === 'string' ? createDefinitionsFilter(filters, includeImageFilters) : filters
		return DataProvider<[component: DataTableName, pageSize: number, page: number], DefinitionsPage<object>>({
			provider: async ([component, pageSize, page], signal, setProgress) => {
				const conduit = await Relic.connected
				if (signal.aborted)
					return undefined

				const lowercaseComponent = component.toLowerCase()
				if (filtersObj?.componentNameContains?.length && !filtersObj.componentNameContains.some(namePart => lowercaseComponent.includes(namePart.toLowerCase())))
					return undefined

				if (isVirtualTableName(component))
					return await DataVirtualTables.page(component, pageSize, page, filtersObj)

				const definitionsPage = await conduit.definitions.en[component as Exclude<AllComponentNames, 'DeepsightStats'>].page(pageSize, page, filtersObj as never)
				if (signal.aborted)
					return undefined

				return definitionsPage
			},
			cacheSize: 5,
			prepCacheSize: 5,
		})
	}

	export const createImagePaged = (filters?: DefinitionsFilter<object> | string) => {
		const filtersObj = typeof filters === 'string' ? createDefinitionsFilter(filters, true) : filters
		return DataProvider<[component: DataTableName, pageSize: number, page: number], DefinitionsImagePage<object>>({
			provider: async ([component, pageSize, page], signal, setProgress) => {
				const conduit = await Relic.connected
				if (signal.aborted)
					return undefined

				const lowercaseComponent = component.toLowerCase()
				if (filtersObj?.componentNameContains?.length && !filtersObj.componentNameContains.some(namePart => lowercaseComponent.includes(namePart.toLowerCase())))
					return undefined

				if (isVirtualTableName(component))
					return undefined

				const definitionsPage = await conduit.definitions.en[component as Exclude<AllComponentNames, 'DeepsightStats'>].imagePage(pageSize, page, filtersObj as never)
				if (signal.aborted)
					return undefined

				return definitionsPage
			},
			cacheSize: 5,
			prepCacheSize: 5,
		})
	}

	export const createReferencesPaged = (component: DataTableName, hash: number | string) => {
		return DataProvider<[pageSize: number, page: number], DefinitionReferencesPage>({
			provider: async ([pageSize, page], signal, setProgress) => {
				if (isVirtualTableName(component))
					return DataVirtualTables.getReferencesPage(pageSize, page) as DefinitionReferencesPage

				const conduit = await Relic.connected
				if (signal.aborted)
					return undefined

				return await conduit.definitions.en[component as Exclude<AllComponentNames, 'DeepsightStats'>].getReferencing(hash, pageSize, page)
			},
			cacheSize: 5,
			prepCacheSize: 5,
		})
	}

	export function createDefinitionsFilter (filterText?: string, includeImageFilters = false): DefinitionsFilter<object> | undefined {
		if (!filterText)
			return undefined

		const filter: DefinitionsFilter<object> = {}

		const tokens = tokeniseFilterText(filterText).filter(token => token.length > 3)
		for (const token of tokens) {
			const lowercaseToken = token.toLowerCase()
			if (lowercaseToken.startsWith('table:')) {
				Arrays.resolve(filter.componentNameContains ??= []).push(token.substring(6))
				continue
			}

			if (lowercaseToken.startsWith('image:')) {
				if (includeImageFilters) {
					const category = DeepsightImageCategories.fromAlias(lowercaseToken.substring(6))
					if (category !== undefined)
						Arrays.resolve(filter.imageCategories ??= []).push(category)
				}
				continue
			}

			if (lowercaseToken.startsWith('deep:')) {
				Arrays.resolve(filter.deepContains ??= []).push(token.substring(5))
				continue
			}

			if (token.startsWith('$')) {
				Arrays.resolve(filter.jsonPathExpression ??= []).push(token)
				continue
			}

			Arrays.resolve(filter.nameContainsOrHashIs ??= []).push(token)
		}

		return filter
	}

	export function hasImageFilter (filterText?: string): boolean {
		return tokeniseFilterText(filterText)
			.some(token => token.toLowerCase().startsWith('image:'))
	}

	function tokeniseFilterText (filterText?: string): string[] {
		if (!filterText)
			return []

		filterText = filterText.replace(/\s+/g, ' ').trim()

		let inQuotes = false
		const tokens: string[] = ['']
		for (let i = 0; i < filterText.length; i++) {
			const char = filterText[i]
			if (char === '"') {
				inQuotes = !inQuotes
				continue
			}

			if (char === ' ' && !inQuotes) {
				tokens.push('')
				continue
			}

			tokens[tokens.length - 1] += char
		}

		return tokens
	}
}

export default DataProvider

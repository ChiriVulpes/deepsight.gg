import type { AllComponentNames, DefinitionsPage, DefinitionWithLinks } from 'conduit.deepsight.gg/DefinitionComponents'
import { State } from 'kitsui'
import Relic from 'Relic'
import { _ } from 'utility/Objects'

type DataProviderParam = number | string | boolean
interface DataProvider<PARAMS extends DataProviderParam[], T> {
	prep (...params: PARAMS): void
	get (...params: PARAMS): State.Async<T | undefined>
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
	}
}

namespace DataProvider {

	export const SINGLE = DataProvider<[component: AllComponentNames, hash: number | string], DefinitionWithLinks<object>>({
		provider: async ([component, hash], signal, setProgress) => {
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

	export const PAGED = DataProvider<[component: AllComponentNames, pageSize: number, page: number], DefinitionsPage<object>>({
		provider: async ([component, pageSize, page], signal, setProgress) => {
			const conduit = await Relic.connected
			if (signal.aborted)
				return undefined

			const definitionsPage = await conduit.definitions.en[component as Exclude<AllComponentNames, 'DeepsightStats'>].page(pageSize, page)
			if (signal.aborted)
				return undefined

			return definitionsPage
		},
		cacheSize: 5,
		prepCacheSize: 5,
	})
}

export default DataProvider

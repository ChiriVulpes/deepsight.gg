import type { AllComponentNames, DefinitionWithLinks } from 'conduit.deepsight.gg/DefinitionComponents'
import { State } from 'kitsui'
import Relic from 'Relic'
import { _ } from 'utility/Objects'

namespace DataProvider {

	interface CachedData {
		component: AllComponentNames
		hash: number | string
		definition: State.Async<DefinitionWithLinks<object> | undefined>
	}

	const cachedData: CachedData[] = []
	const prepCache: CachedData[] = []

	export function prep (component: AllComponentNames, hash: number | string): void {
		let cached = _
			?? cachedData.find(item => item.component === component && `${item.hash}` === `${hash}`)
			?? prepCache.find(item => item.component === component && `${item.hash}` === `${hash}`)
		if (cached)
			return

		cached = getInternal(component, hash)
		prepCache.push(cached)

		if (prepCache.length > 200)
			prepCache.shift()
	}

	export function get (component: AllComponentNames, hash: number | string): State.Async<DefinitionWithLinks<object> | undefined> {
		let cached = cachedData.find(item => item.component === component && `${item.hash}` === `${hash}`)
		if (cached)
			return cached.definition

		const prepCacheIndex = prepCache.findIndex(item => item.component === component && `${item.hash}` === `${hash}`)
		if (prepCacheIndex !== -1) {
			cached = prepCache[prepCacheIndex]
			// Move from prepCache to cachedData
			prepCache.splice(prepCacheIndex, 1)
			cachedData.push(cached)
			return cached.definition
		}

		cached = getInternal(component, hash)
		cachedData.push(cached)

		if (cachedData.length > 20)
			cachedData.shift()

		return cached.definition
	}

	function getInternal (component: AllComponentNames, hash: number | string): CachedData {
		return {
			component,
			hash,
			definition: State.Async(State.Owner.create(), async (signal, setProgress) => {
				const conduit = await Relic.connected
				if (signal.aborted)
					return undefined

				const result = await conduit.definitions.en[component as Exclude<AllComponentNames, 'DeepsightStats'>].getWithLinks(hash)
				if (!result || signal.aborted)
					return undefined

				return result
			}) as State.Async<DefinitionWithLinks<object> | undefined>,
		}
	}
}

export default DataProvider

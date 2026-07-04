import type { InventoryItemHashes } from 'deepsight.gg/Enums'
import { ItemState as InventoryItemState } from 'bungie-api-ts/destiny2'
import Definitions from 'model/Definitions'
import type { ItemStateOptional } from 'model/Items'

export const bungieIcon = (icon?: string) =>
	!icon ? undefined
		: icon.startsWith('http') ? icon
			: `https://www.bungie.net${icon.startsWith('/') ? '' : '/'}${icon}`

export const sumStats = (stats: Record<string | number, { value: number } | undefined> | undefined) =>
	Object.values(stats ?? {})
		.reduce((total, stat) => total + (typeof stat?.value === 'number' ? stat.value : 0), 0)

export const sourceKey = (sources: { type: string, id: string | number }[] | undefined) =>
	sources
		?.map(source => `${source.type}:${source.id}`)
		.sort()
		.join(',')

export const itemStateHas = (state: InventoryItemState, itemState: InventoryItemState | undefined) =>
	!!((itemState ?? InventoryItemState.None) & state)

export const breakerKey = (item: ItemStateOptional) => [
	...Definitions.DeepsightBreakerTypeDefinition.value?.[item.definition?.hash as InventoryItemHashes]?.types ?? [],
	...item.definition?.sockets.flatMap(s => s.plugs.flatMap(plugHash => Definitions.DeepsightBreakerTypeDefinition.value?.[plugHash as InventoryItemHashes]?.types ?? [])) ?? [],
].distinct().sort((a, b) => a - b).at(0)

export const isExotic = (item: ItemStateOptional) => {
	const rarity = item.definition?.rarity
	return rarity !== undefined && item.provider.rarities[rarity]?.displayProperties.name?.toLowerCase() === 'exotic'
}

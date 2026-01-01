import type Inventory from 'conduit.deepsight.gg/item/Inventory'
import type { Item, ItemInstance, ItemProvider, ItemSocket, ItemSocketDefinition } from 'conduit.deepsight.gg/item/Item'
import { State } from 'kitsui'
import type { DestinyItemSocketEntryPlugItemDefinition } from 'node_modules/bungie-api-ts/destiny2'
import { InventoryBucketHashes } from 'node_modules/deepsight.gg/Enums'

export interface ItemReference {
	readonly is: 'item-reference'
	readonly hash: number
}

export interface ItemState {
	readonly definition: Item
	readonly instance?: ItemInstance
	readonly characterId?: string
	readonly provider: ItemProvider
}

export interface ItemStateOptional {
	readonly definition?: Item
	readonly instance?: ItemInstance
	readonly characterId?: string
	readonly provider: ItemProvider
}

export function ItemState (owner: State.Owner, item: State.Or<ItemReference | ItemInstance | Item>, provider: State.Or<ItemProvider>): State<ItemState>
export function ItemState (owner: State.Owner, item: State.Or<ItemReference | ItemInstance | Item | undefined>, provider: State.Or<ItemProvider>): State<ItemStateOptional>
export function ItemState (owner: State.Owner, item: State.Or<ItemReference | ItemInstance | Item | undefined>, provider: State.Or<ItemProvider>): State<ItemStateOptional> {
	return State.Map(owner, [State.get(item), State.get(provider)], (item, provider) => ItemState.resolve(item, provider))
}

export namespace ItemState {
	export function resolve (item: ItemReference | ItemInstance | Item, provider: ItemProvider): ItemState
	export function resolve (item: ItemReference | ItemInstance | Item | undefined, provider: ItemProvider): ItemStateOptional
	export function resolve (item: ItemReference | ItemInstance | Item | undefined, provider: ItemProvider): ItemStateOptional {
		const characterId = item?.is === 'item-instance'
			? Object.values((provider as Inventory).characters ?? {})
				.find(character => [...character.items, ...character.equippedItems].some(i => i.id === item.id))
				?.id
			: undefined
		return {
			definition: item?.is === 'item' ? item : item && provider.items[item.is === 'item-instance' ? item.itemHash : item.hash],
			instance: item?.is === 'item-instance' ? item : undefined,
			characterId: characterId,
			provider: provider,
		}
	}
}

export interface InventoryItemSocket {
	readonly definition: ItemSocketDefinition
	readonly instance?: undefined
	readonly provider: ItemProvider
}

export interface InventoryItemSocketInstanced {
	readonly definition: ItemSocketDefinition
	readonly characterId?: string
	readonly instance: ItemSocket
	readonly provider: Inventory
}

export type InventoryItemSocketTypes =
	| InventoryItemSocket
	| InventoryItemSocketInstanced

namespace Items {

	export function getPlugHashes (socket: InventoryItemSocketTypes): DestinyItemSocketEntryPlugItemDefinition[] {
		return socket.instance
			? [
				...socket.instance.availableReusablePlugs ?? [],
				...socket.provider.characters[socket.characterId!]?.plugSets?.[socket.instance.availableCharacterPlugSet!] ?? [],
				...socket.provider.profilePlugSets?.[socket.instance.availableProfilePlugSet!] ?? [],
				...!socket.instance.availableInventoryPlugsSocketType ? []
					: socket.provider.profileItems
						.filter(plug => {
							if (plug.bucketHash !== InventoryBucketHashes.Modifications)
								return false

							const socketPlugWhitelist = socket.provider.socketTypes[socket.instance.availableInventoryPlugsSocketType!].plugWhitelist ?? []
							const plugDef = socket.provider.plugs[plug.itemHash]
							return !!plugDef && socketPlugWhitelist.some(wh => wh.categoryHash === plugDef.categoryHash)
						})
						.map((plug): DestinyItemSocketEntryPlugItemDefinition => ({ plugItemHash: plug.itemHash })),
			]
			: socket.definition.plugs.map(plugHash => ({ plugItemHash: plugHash }))
	}
}

export default Items

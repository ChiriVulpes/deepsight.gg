import type Collections from 'conduit.deepsight.gg/item/Collections'
import type { Item, ItemInstance } from 'conduit.deepsight.gg/item/Item'
import { State } from 'kitsui'

export interface ItemReference {
	readonly is: 'item-reference'
	readonly hash: number
}

export interface ItemState {
	readonly definition: Item
	readonly instance?: ItemInstance
	readonly collections: Collections
}

export interface ItemStateOptional {
	readonly definition?: Item
	readonly instance?: ItemInstance
	readonly collections: Collections
}

export function ItemState (owner: State.Owner, item: State.Or<ItemReference | ItemInstance>, collections: State.Or<Collections>): State<ItemState>
export function ItemState (owner: State.Owner, item: State.Or<ItemReference | ItemInstance | undefined>, collections: State.Or<Collections>): State<ItemStateOptional>
export function ItemState (owner: State.Owner, item: State.Or<ItemReference | ItemInstance | undefined>, collections: State.Or<Collections>): State<ItemStateOptional> {
	return State.Map(owner, [State.get(item), State.get(collections)], (item, collections) => ItemState.resolve(item, collections))
}

export namespace ItemState {
	export function resolve (item: ItemReference | ItemInstance, collections: Collections): ItemState
	export function resolve (item: ItemReference | ItemInstance | undefined, collections: Collections): ItemStateOptional
	export function resolve (item: ItemReference | ItemInstance | undefined, collections: Collections): ItemStateOptional {
		return {
			definition: item && collections.items[item.is === 'item-instance' ? item.itemHash : item.hash],
			instance: item?.is === 'item-instance' ? item : undefined,
			collections,
		}
	}
}

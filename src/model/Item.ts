import type { Item, ItemInstance, ItemProvider } from 'conduit.deepsight.gg/item/Item'
import { State } from 'kitsui'

export interface ItemReference {
	readonly is: 'item-reference'
	readonly hash: number
}

export interface ItemState {
	readonly definition: Item
	readonly instance?: ItemInstance
	readonly provider: ItemProvider
}

export interface ItemStateOptional {
	readonly definition?: Item
	readonly instance?: ItemInstance
	readonly provider: ItemProvider
}

export function ItemState (owner: State.Owner, item: State.Or<ItemReference | ItemInstance>, provider: State.Or<ItemProvider>): State<ItemState>
export function ItemState (owner: State.Owner, item: State.Or<ItemReference | ItemInstance | undefined>, provider: State.Or<ItemProvider>): State<ItemStateOptional>
export function ItemState (owner: State.Owner, item: State.Or<ItemReference | ItemInstance | undefined>, provider: State.Or<ItemProvider>): State<ItemStateOptional> {
	return State.Map(owner, [State.get(item), State.get(provider)], (item, provider) => ItemState.resolve(item, provider))
}

export namespace ItemState {
	export function resolve (item: ItemReference | ItemInstance, provider: ItemProvider): ItemState
	export function resolve (item: ItemReference | ItemInstance | undefined, provider: ItemProvider): ItemStateOptional
	export function resolve (item: ItemReference | ItemInstance | undefined, provider: ItemProvider): ItemStateOptional {
		return {
			definition: item && provider.items[item.is === 'item-instance' ? item.itemHash : item.hash],
			instance: item?.is === 'item-instance' ? item : undefined,
			provider: provider,
		}
	}
}

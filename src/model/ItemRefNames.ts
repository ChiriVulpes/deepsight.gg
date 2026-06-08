import type { Item } from 'conduit.deepsight.gg/item/Item'

export interface ItemRefNames {
	moment: string
	item: string
}

const refNames = new WeakMap<Item, ItemRefNames>()

namespace ItemRefNames {

	export function get (item: Item) {
		return refNames.get(item)
	}

	export function set (item: Item, value: ItemRefNames) {
		refNames.set(item, value)
	}

}

export default ItemRefNames

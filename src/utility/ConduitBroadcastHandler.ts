import DisplaySlot from 'component/core/DisplaySlot'
import type Toast from 'component/core/Toast'
import { ToastStream } from 'component/core/Toast'
import Item from 'component/item/Item'
import CharacterButton from 'component/profile/CharacterButton'
import type { ConduitOperation, RelatedItem } from 'conduit.deepsight.gg/ConduitMessageRegistry'
import type Inventory from 'conduit.deepsight.gg/item/Inventory'
import type { ItemProvider } from 'conduit.deepsight.gg/item/Item'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import { ItemState, type ItemReference } from 'model/Items'
import Relic from 'Relic'
import Env from 'utility/Env'

namespace ConduitBroadcastHandler {

	export const provider = State<ItemProvider | undefined>(undefined)

	export async function listen () {
		const stream = ToastStream().appendTo(Component.getBody())
		const conduit = await Relic.connected

		let currentOperationsToast: Toast | undefined
		const activeOperations = State<ConduitOperation[]>([])
		conduit.on.startOperation(operation => {
			activeOperations.value.push(operation)
			activeOperations.emit()
			if (!currentOperationsToast) stream.add(toast => currentOperationsToast = toast
				.setLoading()
				.tweak(toast => DisplaySlot()
					.style('conduit-operations')
					.use({ activeOperations, removing: toast.removing }, (slot, { activeOperations: operations, removing }) => {
						if (!operations.length)
							Component()
								.style('conduit-operations-operation')
								.text.set(quilt => quilt['conduit-operations/no-operations']())
								.appendTo(slot)

						if (removing)
							return

						const grouped = operations.groupBy(op => op.type)
						for (const [, operations] of grouped) {
							const operation = operations[0]
							Component()
								.style('conduit-operations-operation')
								.tweak(component => appendRelatedItems(component, operation.related))
								.append(Component()
									.text.set(quilt => quilt['conduit-operations/operation'](operation.type, operations.length > 1 ? operations.length : undefined))
								)
								.appendTo(slot)
						}
					})
					.appendTo(toast.content)
				)
			)
		})
		conduit.on.endOperation(operationId => {
			const index = activeOperations.value.findIndex(op => op.id === operationId)
			if (index !== -1) {
				activeOperations.value.splice(index, 1)
				activeOperations.emit()
			}

			if (!activeOperations.value.length) {
				setTimeout(() => {
					if (activeOperations.value.length)
						return

					currentOperationsToast?.queueRemove()
					currentOperationsToast = undefined
				}, 400)
			}
		})

		conduit.on.warning(async warning => {
			if (warning.category === 'conduit' && Env.ENVIRONMENT !== 'dev')
				return

			const owner = State.Owner.create()
			let singleItemState: State<ItemState | undefined> | undefined
			let singleCharacterState: State<Inventory['characters'][string] | undefined> | undefined
			const shouldShow = State(true)
			if (warning.related?.length === 1) {
				const related = warning.related[0]
				if (related.is === 'item-reference') {
					singleItemState = provider.map(owner, provider => provider && ItemState.resolve(toItemReference(related), provider))
					shouldShow.bind(owner, singleItemState.truthy)
				}
				else {
					singleCharacterState = provider.map(owner, provider => getCharacter(provider, related.characterId))
					shouldShow.bind(owner, singleCharacterState.truthy)
				}
			}

			shouldShow.matchManual(true, () => {
				stream.add(toast => {
					toast.style('toast--warning')
					toast.content.text.set(warning.type)

					if (singleItemState) toast
						.style.bind(singleItemState.truthy, 'toast--has-icon')
						.prependWhen(singleItemState.truthy, Slot().use(singleItemState, (slot, itemState) =>
							itemState && Item(itemState)
						))
					else if (singleCharacterState) toast
						.style.bind(singleCharacterState.truthy, 'toast--has-icon')
						.prependWhen(singleCharacterState.truthy, Slot().use(singleCharacterState, (slot, character) =>
							character && CharacterButton(character).tweak(button => button.mode.value = 'simple')
						))

					return toast
				})
			})
		})
	}

	function appendRelatedItems (component: Component, relatedItems?: RelatedItem[]) {
		for (const related of relatedItems ?? [])
			appendRelatedItem(component, related)
	}

	function appendRelatedItem (component: Component, related: RelatedItem) {
		if (related.is === 'item-reference') {
			const itemState = provider.map(component, provider => provider && ItemState.resolve(toItemReference(related), provider))
			Slot()
				.use(itemState, (slot, itemState) => itemState && Item(itemState))
				.appendTo(component)
			return
		}

		const character = provider.map(component, provider => getCharacter(provider, related.characterId))
		Slot()
			.use(character, (slot, character) => character && CharacterButton(character).tweak(button => button.mode.value = 'simple'))
			.appendTo(component)
	}

	function toItemReference (related: Extract<RelatedItem, { is: 'item-reference' }>): ItemReference {
		return {
			is: 'item-reference',
			hash: related.itemHash,
		}
	}

	function getCharacter (provider: ItemProvider | undefined, characterId: string): Inventory['characters'][string] | undefined {
		return isInventoryProvider(provider) ? provider.characters[characterId] : undefined
	}

	function isInventoryProvider (provider: ItemProvider | undefined): provider is Inventory {
		return !!provider && 'characters' in provider
	}
}

export default ConduitBroadcastHandler

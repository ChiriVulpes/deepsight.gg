import DisplaySlot from 'component/core/DisplaySlot'
import type Toast from 'component/core/Toast'
import { ToastStream } from 'component/core/Toast'
import Item from 'component/item/Item'
import type { ConduitOperation, ConduitOperationType, ConduitWarningMessageType, RelatedItem } from 'conduit.deepsight.gg/ConduitMessageRegistry'
import type Inventory from 'conduit.deepsight.gg/item/Inventory'
import type { ItemProvider } from 'conduit.deepsight.gg/item/Item'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import Loading from 'kitsui/component/Loading'
import type { Quilt } from 'lang'
import { WeavingArg } from 'lang'
import { ItemState, type ItemReference } from 'model/Items'
import Relic from 'Relic'
import Env from 'utility/Env'

type RelatedItemReference = Extract<RelatedItem, { is: 'item-reference' }>
type RelatedCharacterReference = Extract<RelatedItem, { is: 'character-reference' }>
type ReplaceAll<T extends string, FROM extends string, TO extends string> = FROM extends ''
	? T
	: T extends `${infer BEFORE}${FROM}${infer AFTER}`
		? `${BEFORE}${TO}${ReplaceAll<AFTER, FROM, TO>}`
		: T
type TrimHyphen<T extends string> = T extends `-${infer REST}`
	? TrimHyphen<REST>
	: T extends `${infer REST}-`
		? TrimHyphen<REST>
		: T
type KebabWord<T extends string> = TrimHyphen<Lowercase<
	ReplaceAll<
		ReplaceAll<
			ReplaceAll<T, '.', '-'>,
			':',
			''
		>,
		'\'',
		''
	>
>>
type KebabCase<T extends string> = T extends `${infer WORD} ${infer REST}`
	? `${KebabWord<WORD>}-${KebabCase<REST>}`
	: KebabWord<T>
type ConduitOperationTextKey<T extends ConduitOperationType = ConduitOperationType> =
	Extract<Quilt.Key, `conduit-operations/operation/${KebabCase<T>}`>
type ConduitWarningTextKey<T extends ConduitWarningMessageType = ConduitWarningMessageType> =
	Extract<Quilt.Key, `conduit-operations/warning/${KebabCase<T>}`>

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
				.style.bind(State.Map(toast, [activeOperations, toast.removing], (operations, removing) => !!operations.length && !removing), 'toast--has-icon')
				.prepend(DisplaySlot()
					.style('conduit-operations-indicator')
					.use({ activeOperations, removing: toast.removing, provider }, (slot, { activeOperations: operations, removing, provider }) => {
						if (removing || !operations.length)
							return

						const relatedItems = uniqueRelatedItemReferences(getRelatedItemReferences(operations))
						if (provider && relatedItems.length === 1) {
							Component()
								.setOwner(toast)
								.tweak(component => appendRelatedItem(component, relatedItems[0], { moving: true }))
								.appendTo(slot)
							return
						}

						Loading()
							.setOwner(toast)
							.style('toast-loader')
							.showForever()
							.appendTo(slot)
					})
				)
				.tweak(toast => DisplaySlot()
					.style('conduit-operations')
					.use({ activeOperations, removing: toast.removing, provider }, (slot, { activeOperations: operations, removing, provider }) => {
						if (!operations.length)
							Component()
								.style('conduit-operations-operation')
								.text.set(quilt => quilt['conduit-operations/no-operations']())
								.appendTo(slot)

						if (removing)
							return

						const grouped = operations.groupBy(op => op.type)
						const allRelatedItems = uniqueRelatedItemReferences(getRelatedItemReferences(operations))
						for (const [, operations] of grouped) {
							const operation = operations[0]
							const relatedItems = uniqueRelatedItemReferences(getRelatedItemReferences(operations))
							Component()
								.setOwner(toast)
								.style('conduit-operations-operation')
								.append(Component()
									.style('conduit-operations-operation-text')
									.tweak(c => c.text.set(quilt => quilt['conduit-operations/operation'](
										quilt[getOperationTextKey(operation.type)](
											getRelatedCharactersArg(c, provider, getRelatedCharacterReferences(operations)),
										),
										operations.length > 1 ? operations.length : undefined,
									)))
								)
								.tweak(component => {
									if (allRelatedItems.length > 1)
										appendRelatedItemList(component, relatedItems)
								})
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

		conduit.on.warning(warning => {
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
					const relatedCharacters = getRelatedCharacterReferences([warning])
					toast.style('toast--warning')
					toast.content.text.bind(provider.map(toast, provider =>
						quilt => quilt[getWarningTextKey(warning.type)](
							getRelatedCharactersArg(toast.content, provider, relatedCharacters),
						)
					))

					if (singleItemState) toast
						.style.bind(singleItemState.truthy, 'toast--has-icon')
						.prependWhen(singleItemState.truthy, Slot()
							.setOwner(toast)
							.use(singleItemState, (slot, itemState) =>
								itemState && Item(itemState)
							)
						)

					return toast
				})
			})
		})
	}

	function appendRelatedItemList (component: Component, relatedItems: RelatedItemReference[]) {
		if (!relatedItems.length)
			return

		Component()
			.style('conduit-operations-related-items')
			.tweak(list => {
				for (const related of relatedItems)
					appendRelatedItem(list, related, { small: true })
			})
			.appendTo(component)
	}

	function appendRelatedItem (component: Component, related: RelatedItemReference, options: { moving?: boolean, small?: boolean } = {}) {
		const itemState = provider.map(component, provider => provider && ItemState.resolve(toItemReference(related), provider))
		Slot()
			.use(itemState, (slot, itemState) => {
				if (!itemState)
					return

				const item = Item(itemState)
				item.moving.value = !!options.moving
				if (options.small)
					item.style('conduit-operations-related-item')
				return item
			})
			.appendTo(component)
	}

	function toItemReference (related: RelatedItemReference): ItemReference {
		return {
			is: 'item-reference',
			hash: related.itemHash,
		}
	}

	function getCharacter (provider: ItemProvider | undefined, characterId: string): Inventory['characters'][string] | undefined {
		return isInventoryProvider(provider) ? provider.characters[characterId] : undefined
	}

	function getRelatedItemReferences (operations: Pick<ConduitOperation, 'related'>[]): RelatedItemReference[] {
		return operations.flatMap(operation => operation.related?.filter(isRelatedItemReference) ?? [])
	}

	function getRelatedCharacterReferences (operations: Pick<ConduitOperation, 'related'>[]): RelatedCharacterReference[] {
		return operations.flatMap(operation => operation.related?.filter(isRelatedCharacterReference) ?? [])
	}

	function isRelatedItemReference (related: RelatedItem): related is RelatedItemReference {
		return related.is === 'item-reference'
	}

	function isRelatedCharacterReference (related: RelatedItem): related is RelatedCharacterReference {
		return related.is === 'character-reference'
	}

	function uniqueRelatedItemReferences (relatedItems: RelatedItemReference[]): RelatedItemReference[] {
		const seen = new Set<string>()
		return relatedItems.filter(related => {
			const key = related.instanceId
				? `instance:${related.instanceId}`
				: `hash:${related.itemHash}/stack:${related.stackSize ?? 1}`
			if (seen.has(key))
				return false

			seen.add(key)
			return true
		})
	}

	function uniqueRelatedCharacters (provider: ItemProvider | undefined, relatedCharacters: RelatedCharacterReference[]): Inventory['characters'][string][] {
		if (!isInventoryProvider(provider))
			return []

		const seen = new Set<string>()
		return relatedCharacters
			.map(related => getCharacter(provider, related.characterId))
			.filter((character): character is Inventory['characters'][string] => {
				if (!character || seen.has(character.id))
					return false

				seen.add(character.id)
				return true
			})
	}

	function getRelatedCharactersArg (owner: State.Owner, provider: ItemProvider | undefined, relatedCharacters: RelatedCharacterReference[]): WeavingArg | undefined {
		const characters = uniqueRelatedCharacters(provider, relatedCharacters)
		if (!characters.length || !isInventoryProvider(provider))
			return undefined

		const component = Component()
			.setOwner(owner)
			.style('conduit-operations-character-references')
			.append(...characters.map(character => getCharacterReferenceComponent(provider, character)))
		return WeavingArg.setRenderable(component, () => characters.map(character => getCharacterName(provider, character)).join(', '))
	}

	function getCharacterReferenceComponent (provider: Inventory, character: Inventory['characters'][string]): Component {
		const component = Component()
			.style('conduit-operations-character-reference')
			.append(Component()
				.style('conduit-operations-character-reference-emblem')
			)
			.append(Component()
				.style('conduit-operations-character-reference-name')
				.text.set(getCharacterName(provider, character))
			)

		if (character.emblem) {
			component
				.style.setVariable('conduit-operations-character-emblem', `url(https://www.bungie.net${character.emblem.displayProperties.icon})`)
				.style.setVariable('conduit-operations-character-colour', `#${character.emblem.background.toString(16).padStart(6, '0')}`)
		}

		return component
	}

	function getCharacterName (provider: Inventory, character: Inventory['characters'][string]): string {
		return provider.classes[character.metadata.classHash as keyof Inventory['classes']]?.displayProperties.name ?? 'Unknown character'
	}

	function isInventoryProvider (provider: ItemProvider | undefined): provider is Inventory {
		return !!provider && 'characters' in provider
	}

	function getOperationTextKey<T extends ConduitOperationType> (type: T): ConduitOperationTextKey<T> {
		return `conduit-operations/operation/${toKebabCase(type)}` as ConduitOperationTextKey<T>
	}

	function getWarningTextKey<T extends ConduitWarningMessageType> (type: T): ConduitWarningTextKey<T> {
		return `conduit-operations/warning/${toKebabCase(type)}` as ConduitWarningTextKey<T>
	}

	function toKebabCase<T extends string> (value: T): KebabCase<T> {
		return value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '') as KebabCase<T>
	}
}

export default ConduitBroadcastHandler

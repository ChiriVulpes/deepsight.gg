import DisplaySlot from 'component/core/DisplaySlot'
import type Toast from 'component/core/Toast'
import { ToastStream } from 'component/core/Toast'
import Item from 'component/item/Item'
import type { ConduitOperation } from 'conduit.deepsight.gg/ConduitMessageRegistry'
import type { ItemProvider } from 'conduit.deepsight.gg/item/Item'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import { ItemState } from 'model/Items'
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
								.text.set(quilt => quilt['conduit-operations/operation'](operation.type, operations.length > 1 ? operations.length : undefined))
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
			const shouldShow = State(true)
			if (warning.related?.length === 1) {
				const item = warning.related[0]
				if (item.is === 'item' || item.is === 'item-instance') {
					singleItemState = provider.map(owner, provider => provider && ItemState.resolve(item, provider))
					shouldShow.bind(owner, singleItemState.truthy)
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

					return toast
				})
			})
		})
	}
}

export default ConduitBroadcastHandler

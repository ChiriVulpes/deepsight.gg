import DisplaySlot from 'component/core/DisplaySlot'
import type Toast from 'component/core/Toast'
import { ToastStream } from 'component/core/Toast'
import type { ConduitOperation } from 'conduit.deepsight.gg/ConduitMessageRegistry'
import { Component, State } from 'kitsui'
import Relic from 'Relic'

namespace ConduitBroadcastHandler {
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
	}
}

export default ConduitBroadcastHandler

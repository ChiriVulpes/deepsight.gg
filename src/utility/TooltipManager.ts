import type { Component } from 'kitsui'
import { State } from 'kitsui'
import type { PopoverComponentRegisteredExtensions } from 'kitsui/component/Popover'
import type Tooltip from 'kitsui/component/Tooltip'

export interface TooltipDefinition<TOOLTIP extends Tooltip, PARAMS extends any[], STATES extends Record<string, State.Mutable<any> | undefined>> {
	states: STATES
	apply?(states: TooltipStatesManager<STATES>, applyTo: Component & PopoverComponentRegisteredExtensions, ...params: PARAMS): unknown
	update (states: TooltipStatesManager<STATES>, ...params: PARAMS): unknown
	onHover?(states: TooltipStatesManager<STATES>, ...params: PARAMS): unknown
	build (states: TooltipStatesManager<STATES>, tooltip: TOOLTIP, ...params: PARAMS): TOOLTIP
}

export type TooltipStatesManager<STATES extends Record<string, State.Mutable<any> | undefined>> =
	& STATES
	& { [NAME in keyof STATES as `update${Capitalize<NAME & string>}`]: ({
		(value: State.Or<STATES[NAME] extends State.Mutable<infer T> | undefined ? T : never>): void
	}) }

interface TooltipManager<PARAMS extends any[]> {
	apply (applyTo: Component, ...params: PARAMS): void
	update (...params: PARAMS): void
}

function TooltipManager<TOOLTIP extends Tooltip, PARAMS extends any[], STATES extends Record<string, State.Mutable<any> | undefined>> (componentBuilder: Component.Builder<never, TOOLTIP>, definition: TooltipDefinition<TOOLTIP, PARAMS, STATES>): TooltipManager<PARAMS> & Component.Builder<never, TOOLTIP> {
	let instance: TOOLTIP | undefined

	const states = new Proxy(definition.states, {
		get (target, p, receiver) {
			if (typeof p === 'string' && p.startsWith('update')) {
				const name = `${p[6].toLowerCase()}${p.slice(7)}` as keyof STATES
				return (value: State.Or<unknown>) => {
					if (!target[name] || !instance)
						return

					if (State.is(value))
						target[name].bind(instance, value)
					else
						target[name].value = value
				}
			}

			return target[p as keyof typeof target]
		},
	}) as TooltipStatesManager<STATES>

	const result: TooltipManager<PARAMS> = {
		apply (component, ...params) {
			const componentWithPopover = instance
				? component.setTooltip(instance)
				: component.setTooltip(tooltip => instance ??= definition.build(states, tooltip as TOOLTIP, ...params)
					.notHoverable()
				)

			definition.apply?.(states, componentWithPopover, ...params)

			State.Use(component, { focused: componentWithPopover.hoveredOrHasFocused, visible: componentWithPopover.popover.visible }).subscribe(component, ({ focused, visible }, { visible: oldVisible } = { focused: false, visible: false }) => {
				if (focused && visible && !oldVisible) {
					result.update(...params)
					definition.onHover?.(states, ...params)
				}
			})
		},
		update (...params) {
			definition.update(states, ...params)
		},
	}

	return Object.assign(componentBuilder, result)
}

export default TooltipManager

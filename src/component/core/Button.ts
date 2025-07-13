import { Component, State } from 'kitsui'

interface ButtonExtensions {
	readonly disabled: State<boolean>
	setDisabled (disabled: boolean, reason: string): this
	bindDisabled (state: State<boolean>, reason: string): this
	unbindDisabled (state: State<boolean>): this
}

interface Button extends Component, ButtonExtensions { }

const Button = Component('button', (component): Button => {
	const button = component.style('button')
	const buttonText = Component().style('button-text').appendTo(button)
	button.extendJIT('text', button => buttonText.text.rehost(button))
	const disabledReasons = State<Set<string>>(new Set())
	const disabled = disabledReasons.mapManual(reasons => !!reasons.size)
	const unsubscribeStates = new Map<State<boolean>, Map<State.Unsubscribe, string>>()
	const unsubscribeReasons = new Map<string, State.Unsubscribe>()
	return button
		.style.bind(disabled, 'button--disabled')
		.attributes.bind(disabled, 'disabled')
		.attributes.bind(disabled, 'aria-disabled', 'true')
		.extend<ButtonExtensions>(button => ({
			disabled,
			setDisabled (disabled, reason) {
				unsubscribeReasons.get(reason)?.(); unsubscribeReasons.delete(reason)
				if (disabled)
					disabledReasons.value.add(reason)
				else
					disabledReasons.value.delete(reason)
				disabledReasons.emit()
				return button
			},
			bindDisabled (state, reason) {
				unsubscribeReasons.get(reason)?.(); unsubscribeReasons.delete(reason)
				const unsubscribe = state.use(button, value => {
					if (value)
						disabledReasons.value.add(reason)
					else
						disabledReasons.value.delete(reason)
					disabledReasons.emit()
				})
				const map = unsubscribeStates.get(state) ?? new Map<State.Unsubscribe, string>()
				unsubscribeStates.set(state, map)
				map.set(unsubscribe, reason)
				return button
			},
			unbindDisabled (state) {
				const map = unsubscribeStates.get(state)
				if (map) for (const [unsubscribe, reason] of map) {
					unsubscribe()
					unsubscribeReasons.delete(reason)
				}
				unsubscribeStates.delete(state)
				return button
			},
		}))
})

export default Button

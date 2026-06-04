import { Component, State } from 'kitsui'
import Applicator from 'kitsui/utility/Applicator'

interface TextInputExtensions {
	readonly state: State<string>
	readonly default: Applicator.Optional<this, string>
	setValue (value?: string): this
	reset (): this
}

interface TextInput extends Component<HTMLInputElement>, TextInputExtensions { }

const TextInput = Component('input', (component): TextInput => {
	let defaultValue = ''
	const state = State(defaultValue)

	const input = component.replaceElement('input')
		.attributes.set('type', 'text')
		.style('text-input')

	input.onRealise(() => input.element!.value = state.value)
	input.event.subscribe('input', () => state.value = input.element?.value ?? state.value)

	return input.extend<TextInputExtensions>(input => ({
		state,
		setValue (value) {
			state.value = value ?? ''
			if (input.element)
				input.element.value = state.value
			return input
		},
		default: Applicator(input, (newDefaultValue = '') => {
			if (newDefaultValue === defaultValue)
				return

			if (!input.element || input.element.value === defaultValue) {
				state.value = newDefaultValue
				if (input.element)
					input.element.value = newDefaultValue
			}

			defaultValue = newDefaultValue
		}),
		reset () {
			state.value = defaultValue
			if (input.element)
				input.element.value = defaultValue
			return input
		},
	}))
})

export default TextInput

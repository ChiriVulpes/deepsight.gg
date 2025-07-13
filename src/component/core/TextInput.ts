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

	input.event.subscribe('input', () => state.value = input.element.value)

	return input.extend<TextInputExtensions>(input => ({
		state,
		setValue (value) {
			state.value = input.element.value = value ?? ''
			return input
		},
		default: Applicator(input, (newDefaultValue = '') => {
			if (newDefaultValue === defaultValue)
				return

			if (input.element.value === defaultValue)
				state.value = input.element.value = newDefaultValue

			defaultValue = newDefaultValue
		}),
		reset () {
			state.value = input.element.value = defaultValue
			return input
		},
	}))
})

export default TextInput

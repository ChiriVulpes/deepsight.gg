import { Component, State } from 'kitsui'

interface CheckboxExtensions {
	readonly checked: State<boolean>
	readonly label: Component
	setChecked (value: boolean): this
	setInputName (value: string | undefined): this
	setInputType (value: 'checkbox' | 'radio'): this
	setInputValue (value: string | undefined): this
}

interface Checkbox extends Component, CheckboxExtensions { }

const Checkbox = Component<[], Checkbox>('label', (component): Checkbox => {
	const label = Component().style('checkbox-label')
	const checked = State(false)
	const name = State<string | undefined>(undefined)
	const type = State<'checkbox' | 'radio'>('checkbox')
	const value = State<string | undefined>(undefined)
	const input = Component('input')
		.style('checkbox-input')
		.attributes.bind('name', name)
		.attributes.bind('type', type)
		.attributes.bind('value', value)
		.event.subscribe('change', event => checked.value = event.host.element?.checked ?? checked.value)
		.tweak(input => {
			input.onRealise(syncChecked)
			checked.subscribe(input, syncChecked)

			function syncChecked () {
				if (input.element)
					input.element.checked = checked.value
			}
		})

	return component.style('checkbox')
		.append(input)
		.append(Component()
			.style('checkbox-icon')
			.style.bind(checked, 'checkbox-icon--checked')
			.append(Component()
				.style('checkbox-icon-active-border')
				.style.bind(component.hoveredOrHasFocused, 'checkbox-icon-active-border--focus')
				.style.bind(component.active, 'checkbox-icon-active-border--active')
				.style.bind(checked, 'checkbox-icon-active-border--checked')
			)
			.append(Component()
				.style('checkbox-icon-check')
				.style.bind(checked, 'checkbox-icon-check--checked')
				.style.bind(component.active, 'checkbox-icon-check--active')
			)
		)
		.append(label)
		.extend<CheckboxExtensions>(checkbox => ({
			checked,
			label,
			setChecked (value) {
				checked.value = value
				return checkbox
			},
			setInputName (newName) {
				name.value = newName
				return checkbox
			},
			setInputType (newType) {
				type.value = newType
				return checkbox
			},
			setInputValue (newValue) {
				value.value = newValue
				return checkbox
			},
		}))
})

export default Checkbox

import { Component, State } from 'kitsui'

interface CheckboxExtensions {
	readonly checked: State<boolean>
	readonly label: Component
}

interface Checkbox extends Component, CheckboxExtensions { }

const Checkbox = Component('label', (component): Checkbox => {
	const label = Component().style('checkbox-label')
	const checked = State(false)
	const input = Component('input')
		.style('checkbox-input')
		.attributes.set('type', 'checkbox')
		.event.subscribe('change', event => checked.value = event.host.element.checked)

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
		}))
})

export default Checkbox

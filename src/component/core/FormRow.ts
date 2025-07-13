import { Component } from 'kitsui'
import type TextManipulator from 'kitsui/utility/TextManipulator'

interface FormRowExtensions {
	readonly label: Component
	readonly labelText: TextManipulator<this>
}

interface FormRow extends Component<HTMLLabelElement>, FormRowExtensions { }

const FormRow = Component('label', (component): FormRow => {
	const label = Component().style('form-row-label')
	return component.replaceElement('label')
		.style('form-row')
		.append(label)
		.extend<FormRowExtensions>(row => ({
			label,
			labelText: undefined!,
		}))
		.extendJIT('labelText', row => row.label.text.rehost(row))
})

export default FormRow

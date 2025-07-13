import { Component } from 'kitsui'
import type TextManipulator from 'kitsui/utility/TextManipulator'

interface DetailsExtensions {
	readonly summary: Component
	readonly summaryText: TextManipulator<this>
	readonly content: Component
}

interface Details extends Component<HTMLDetailsElement>, DetailsExtensions { }

export default Component('details', (component): Details => {
	const summary = Component('summary').style('details-summary')
	const content = Component().style('details-content')

	return component.replaceElement('details')
		.style('details')
		.append(summary, content)
		.extend<DetailsExtensions>(details => ({
			summary,
			summaryText: undefined!,
			content,
		}))
		.extendJIT('summaryText', details => details.summary.text.rehost(details))
})

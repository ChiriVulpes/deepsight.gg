import { Component, State } from 'kitsui'
import type TextManipulator from 'kitsui/utility/TextManipulator'

interface DetailsExtensions {
	readonly summary: Component
	readonly summaryText: TextManipulator<this>
	readonly content: Component
	readonly open: State.Mutable<boolean>
}

interface Details extends Component<HTMLDetailsElement>, DetailsExtensions { }

export default Component('details', (component): Details => {
	const open = State(false)

	const summary = Component('summary').style('details-summary')
	const content = Component().style('details-content').style.bind(open, 'details-content--open')

	return component.replaceElement('details')
		.style('details')
		.style.bind(open, 'details--open')
		.append(summary, content)
		.extend<DetailsExtensions>(details => ({
			summary,
			summaryText: undefined!,
			content,
			open,
		}))
		.extendJIT('summaryText', details => details.summary.text.rehost(details))
		.event.subscribe('toggle', event => {
			open.value = event.host.element.open
		})
		.tweak(details => {
			open.subscribe(details, () => {
				details.element.open = open.value
			})
		})
})

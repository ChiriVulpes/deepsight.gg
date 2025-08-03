import { Component, State } from 'kitsui'
import type TextManipulator from 'kitsui/utility/TextManipulator'

interface DetailsExtensions {
	readonly summary: Component
	readonly summaryText: TextManipulator<this>
	readonly content: Component
	/** The current state of the details */
	readonly open: State.Mutable<boolean>
	/** A state that only changes when the user manually opens or closes the details */
	readonly manualOpenState: State.Mutable<boolean>
	readonly transitioning: State<boolean>
}

interface Details extends Component<HTMLDetailsElement>, DetailsExtensions { }

export default Component('details', (component): Details => {
	const open = State(false)
	const manualOpenState = State(false)
	const transitioning = State(false)

	const summary = Component('summary').style('details-summary')
	const content = Component().style('details-content').style.bind(open, 'details-content--open')

	let isAutoToggle = false
	let isManualToggle = false
	return component.replaceElement('details')
		.style('details')
		.style.bind(open, 'details--open')
		.append(summary, content)
		.extend<DetailsExtensions>(details => ({
			summary,
			summaryText: undefined!,
			content,
			manualOpenState,
			open,
			transitioning,
		}))
		.extendJIT('summaryText', details => details.summary.text.rehost(details))
		.event.subscribe(['transitionstart', 'transitionend'], event => {
			if (event.propertyName !== '--details-dummy-transitioning')
				return

			transitioning.value = event.type === 'transitionstart'
		})
		.event.subscribe('toggle', event => {
			if (isAutoToggle) {
				isAutoToggle = false
				return
			}

			isManualToggle = true
			manualOpenState.value = open.value = event.host.element.open
		})
		.tweak(details => {
			open.subscribe(details, () => {
				if (!isManualToggle)
					isAutoToggle = true
				details.element.open = open.value
				isManualToggle = false
			})
		})
})

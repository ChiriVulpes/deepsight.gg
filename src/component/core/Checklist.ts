import { Component, State } from 'kitsui'

interface ChecklistExtensions {
	add (initialiser: (item: ChecklistItem) => void): this
}

interface Checklist extends Component, ChecklistExtensions { }

const Checklist = Component('ol', (component): Checklist => {
	return component.style('checklist')
		.extend<ChecklistExtensions>(checklist => ({
			add (initialiser) {
				ChecklistItem()
					.tweak(initialiser)
					.appendTo(checklist)
					.tweak(item => item.marker.text.set(`${checklist.element.children.length}.`))
				return checklist
			},
		}))
})

interface ChecklistItemExtensions {
	readonly marker: Component
	readonly content: Component
	readonly checkIcon: Component
	readonly checked: State.Mutable<boolean>
}

interface ChecklistItem extends Component, ChecklistItemExtensions { }

const ChecklistItem = Component('li', (component): ChecklistItem => {
	const checked = State(false)

	const marker = Component().style('checklist-item-marker')
	const content = Component().style('checklist-item-content')
	const checkIcon = Component()
		.style('checklist-item-check-icon')
		.style.bind(checked, 'checklist-item-check-icon--checked')

	return component.style('checklist-item')
		.append(marker, content, checkIcon)
		.extend<ChecklistItemExtensions>(item => ({
			marker,
			content,
			checkIcon,
			checked,
		}))
})

export default Checklist

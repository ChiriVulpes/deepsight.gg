import Button from 'component/core/Button'
import SortDefinitionHelper, { type SortDefinitionId, type SortDefinition as SortDefinitionType, type SortIconClass } from 'component/display/sort/SortDefinition'
import type { SortConfig, SortDisplayRow, SortRow } from 'component/display/sort/SortManager'
import SortManager from 'component/display/sort/SortManager'
import { Component, Kit, State } from 'kitsui'
import Popover from 'kitsui/component/Popover'
import type { ItemStateOptional } from 'model/Items'

interface SortExtensions {
	readonly config: State.Mutable<Sort.Config | undefined>
	readonly sortText: State<string | undefined>
	readonly stateHash: State<string>
	bindButton (button: Component): this
	compare (a: ItemStateOptional, b: ItemStateOptional): number
}

interface Sort extends Component, SortExtensions { }

namespace Sort {
	export interface Config extends SortConfig { }
	export type Definition = SortDefinitionType
}

const Sort = Object.assign(
	Component((component): Sort => {
		component.style('sort-display')

		const config = State<Sort.Config | undefined>(undefined)
		const manager = new SortManager()
		let button: Component | undefined
		const sortRows = Kit.Sortable(manager.displayRows, row => row.key, row => SortDisplayListRow(row, manager), {
			draggable: row => row.type === 'sort',
			inputFilter: event => !(event.target instanceof HTMLElement) || !event.target.closest('button'),
		})
		sortRows.style('sort-row-list')
		sortRows.event.subscribe('commit', (_event, commit) => manager.applyRows(commit.rows))

		config.use(component, config => manager.configure(config))

		component.text.bind(manager.sortText.map(component, text =>
			text ?? (quilt => quilt['display-bar/sort/none']())
		))

		const popover = Popover()
			.style('sort-popover')
			.anchor.from(component)
			.anchor.add('aligned left', 'off top')
			.appendTo(document.body)
		popover.setCloseDueToMouseInputFilter(event =>
			!component.contains(event.targetComponent)
			&& !button?.contains(event.targetComponent ?? undefined)
			&& !popover.containsPopoverDescendant(event.targetComponent ?? undefined)
		)

		Component()
			.style('sort-row-list-heading')
			.text.set(quilt => quilt['display-bar/sort/active/title']())
			.appendTo(popover)

		sortRows.appendTo(popover)

		return component.extend<SortExtensions>(sort => ({
			config,
			sortText: manager.sortText,
			stateHash: manager.stateHash,
			bindButton: boundButton => {
				button = boundButton
				popover.anchor.from(boundButton)
				boundButton.event.subscribe('click', event => {
					if (!config.value)
						return

					event.preventDefault()
					if (popover.visible.value)
						popover.hide()
					else {
						popover.anchor.from(boundButton)
						popover.show()
						popover.focus()
						popover.anchor.apply()
					}
				})
				return sort
			},
			compare: (a, b) => manager.compare(a, b),
		}))
	}),
	{
		Config (config: Sort.Config): Sort.Config {
			return config
		},
		Definition: SortDefinitionHelper.Definition,
	}
)

function SortDisplayListRow (row: State<SortDisplayRow>, manager: SortManager) {
	const initial = row.value
	if (initial.type === 'divider')
		return Component()
			.style('sort-row-divider')
			.tweak(divider => divider.text.bind(row.map(divider, row => row.type === 'divider' ? row.label : '')))

	const sortRow = row as State<SortRow>
	const rowComponent = Component()
		.style('sort-row')
		.tweak(row => row.style.bind(row.hoveredOrHasFocused, 'sort-row--hover'))
		.tweak(row => row.style.bind(row.hasFocused, 'sort-row--focus'))
	rowComponent.style.bind(sortRow.map(rowComponent, row => !row.active), 'sort-row--inactive')
	return rowComponent
		.event.subscribe('click', event => {
			const row = sortRow.value
			if (row.active)
				return

			event.preventDefault()
			manager.activate(row.id)
		})
		.event.subscribe('keydown', event => {
			if (event.target !== event.host.element || !['Enter', ' '].includes(event.key))
				return

			const row = sortRow.value
			if (row.active)
				return

			event.preventDefault()
			manager.activate(row.id)
		})
		.append(Component()
			.style('sort-row-grip')
			.style.bind(rowComponent.hoveredOrHasFocused, 'sort-row-grip--hover')
		)
		.append(Component()
			.style('sort-row-icon')
			.append(SortRowIcon(sortRow))
		)
		.append(Component()
			.style('sort-row-label')
			.text.bind(sortRow.map(rowComponent, row => row.definition.label))
		)
		.append(SortDirectionButton(sortRow, manager))
}

function SortRowIcon (row: State<SortRow>) {
	const initial = row.value.definition.icon
	const icon = initial?.component?.() ?? Component()
	return icon
		.style('sort-row-icon-glyph', sortIconClass(row.value.id))
		.tweak(icon => {
			const iconImage = State.get(initial?.image)
			icon.style.bindVariable('sort-row-icon-image', iconImage.map(icon, image => image && `url(${image})`))
		})
}

function SortDirectionButton (row: State<SortRow>, manager: SortManager) {
	const button = Button()
		.style.remove('button')
		.style('sort-row-button')
		.tweak(button => {
			button.textWrapper.remove()
			button.ariaLabel.set(quilt => quilt['display-bar/sort/action/reverse']())
			button.style.bind(button.hoveredOrHasFocused, 'sort-row-button--hover')
		})
	button
		.append(Component()
			.style('sort-row-button-order')
			.append(Component()
				.text.bind(row.map(button, row => row.reverse ? 'Z' : 'A')))
			.append(Component()
				.text.bind(row.map(button, row => row.reverse ? 'A' : 'Z')))
		)
		.append(Component()
			.style('sort-row-button-arrow')
			.style.bind(row.map(button, row => row.reverse), 'sort-row-button-arrow--active'))
	button
		.bindDisabled(row.map(button, row => !row.active), 'inactive-sort')
		.style.bind(row.map(button, row => row.active), 'sort-row-button--visible')
	return button
		.event.subscribe('pointerdown', event => {
			event.stopPropagation()
		})
		.event.subscribe('click', event => {
			event.preventDefault()
			event.stopPropagation()
			if (row.value.active)
				manager.toggleReverse(row.value.id)
		})
}

function sortIconClass<ID extends SortDefinitionId> (id: ID): SortIconClass<ID> {
	return `sort-row-icon-glyph--${id}` as SortIconClass<ID>
}

export default Sort

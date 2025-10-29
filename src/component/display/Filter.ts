import Button from 'component/core/Button'
import DisplaySlot from 'component/core/DisplaySlot'
import type { Item } from 'conduit.deepsight.gg/Collections'
import { Component, State } from 'kitsui'
import Popover from 'kitsui/component/Popover'
import Slot from 'kitsui/component/Slot'
import { NonNullish } from 'kitsui/utility/Arrays'
import InputBus from 'kitsui/utility/InputBus'
import Mouse from 'kitsui/utility/Mouse'
import Task from 'kitsui/utility/Task'
import type TextManipulator from 'kitsui/utility/TextManipulator'
import { quilt } from 'utility/Text'

// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
interface FilterToken extends String {
	readonly lowercase: string
	readonly displayText: string
	readonly start: number
	readonly end: number
}

namespace FilterToken {
	export function create (text: string, start = 0, end = text.length): FilterToken {
		return Object.assign(String(text), {
			lowercase: (text
				.toLowerCase()
				.replace(EMOJI_REGEX, '')
			),
			displayText: (text
				.replaceAll(' ', '\xa0')
				.replace(EMOJI_REGEX, '')
			),
			start,
			end,
		})
	}
}

interface FilterFunction {
	readonly fullText: State.Or<string>
	readonly isPartial: State.Or<boolean>
	filter (item: Item, token: FilterToken): true | false | 'irrelevant'
	chip?(chip: Filter.Chip, token: FilterToken): unknown
	icon?: true | ((icon: Component, token: FilterToken) => unknown)
}
interface FilterMatch extends FilterFunction {
	readonly id: string
	readonly token: FilterToken
}

interface FilterChipExtensions {
	readonly iconWrapper?: Component
	readonly iconPlaceholder?: Component
	readonly icon?: Component
	readonly textWrapper: Component
	readonly labelWrapper: Component
	readonly labelText: TextManipulator<this>
	readonly mainTextWrapper: Component
}

interface FilterExtensions {
	readonly input: Component<HTMLInputElement>
	readonly filterText: State<string>
	readonly config: State.Mutable<Filter.Config | undefined>
	filter (item: Item, showIrrelevant: boolean): boolean
}

interface Filter extends Component, FilterExtensions { }

namespace Filter {
	export interface Config {
		readonly id: string
		readonly filters: Filter.Definition[]
		readonly allowUppercase?: true
		readonly debounceTime?: number
	}

	export interface Suggestions {
		readonly all: string[]
		filter?(suggestion: string, token: FilterToken | undefined, filters: string[]): boolean
	}

	export interface Definition {
		readonly id: string
		readonly type: 'and' | 'or'
		readonly suggestions: ((owner: State.Owner) => State.Or<Suggestions | string[]>) | State.Or<Suggestions | string[]>
		match (owner: State.Owner, token: FilterToken): FilterFunction | undefined
	}

	export interface Chip extends Component, FilterChipExtensions { }
}

const PLAINTEXT_FILTER_FUNCTION: FilterFunction['filter'] = (item, token) => item.displayProperties.name.toLowerCase().includes(token.lowercase)
const PLAINTEXT_FILTER_TWEAK_CHIP: FilterFunction['chip'] = (chip, token) => chip.style('filter-display-text').style.toggle(token.lowercase.length < 3, 'filter-display-text--inactive')

const EMOJI_ICON_PLACEHOLDER = '⬛'
const EMOJI_REGEX = /(?!\p{N})[\p{Emoji}\p{Extended_Pictographic}]/gu
const EMOJI_SPACE_PLACEHOLDER = '–'
const EMOJI_OR_WHITESPACE_REGEX = /[– ]+/gu

////////////////////////////////////
//#region Filter Display Chip

const Chip = Component((component, match: FilterMatch): Filter.Chip => {
	const iconWrapper = match.icon && Component()
		.style('filter-display-chip-icon-wrapper')

	const iconPlaceholder = iconWrapper && Component()
		.style('filter-display-chip-icon-placeholder')
		.text.set(EMOJI_ICON_PLACEHOLDER)
		.appendTo(iconWrapper)

	const icon = iconWrapper && Component()
		.style('filter-display-chip-icon', `filter-display-chip-icon--${match.id}` as 'filter-display-chip-icon')
		.tweak(icon => typeof match.icon === 'function' && match.icon(icon, match.token))
		.appendTo(iconWrapper)

	const textWrapper = Component()
		.style('filter-display-chip-text-wrapper')

	Component()
		.style('filter-display-chip-text-placeholder')
		.text.set(match.token.displayText)
		.appendTo(textWrapper)

	const labelText = Component()
		.style('filter-display-chip-text-label')
		.appendTo(textWrapper)

	const filterText = Component()
		.style('filter-display-chip-text-main')
		.text.set(match.token.displayText)
		.appendTo(textWrapper)

	return component
		.style('filter-display-chip', `filter-display-chip--${match.id}` as 'filter-display-chip')
		.append(iconWrapper, textWrapper)
		.extend<FilterChipExtensions>(chip => ({
			iconWrapper,
			iconPlaceholder,
			icon,
			textWrapper: textWrapper,
			labelWrapper: labelText,
			labelText: labelText.text.rehost(chip),
			mainTextWrapper: filterText,
		}))
		.extendJIT('text', chip => filterText.text.rehost(chip))
		.tweak(chip => match.chip?.(chip, match.token))
})

//#endregion
////////////////////////////////////

const Filter = Object.assign(
	Component((component): Filter => {
		const filter = component.style('filter')

		const config = State<Filter.Config | undefined>(undefined)

		let filtersOwner: State.Owner.Removable | undefined
		const filterText = State('')
		const caretPosition = State<number | undefined>(0)

		////////////////////////////////////
		//#region Filter Parsing

		const filters = State.Map(filter, [filterText, config], (text, config) => {
			filtersOwner?.remove(); filtersOwner = State.Owner.create()
			text = config?.allowUppercase ? text : text.toLowerCase()

			const tokens = tokenise(text)
			if (tokens.length === 0)
				return []

			const filters: FilterMatch[] = []
			NextToken: for (const token of tokens) {
				for (const filter of config?.filters ?? []) {
					const fn = filter.match(filtersOwner, token)
					if (!fn)
						continue

					filters.push(Object.assign(fn, { token, id: filter.id }))
					continue NextToken
				}

				filters.push({
					id: 'plaintext',
					fullText: config?.allowUppercase ? token.slice() : token.lowercase,
					isPartial: true,
					token,
					filter: PLAINTEXT_FILTER_FUNCTION,
					chip: PLAINTEXT_FILTER_TWEAK_CHIP,
				})
			}

			return filters
		})

		let filterFullTextsOwner: State.Owner.Removable | undefined
		const filterFullTexts = filters.mapManual(filters => {
			filterFullTextsOwner?.remove(); filterFullTextsOwner = State.Owner.create()
			return State.Map(filterFullTextsOwner,
				filters.map(filter => State.get(filter.fullText)),
				(...texts) => texts,
			)
		})

		const appliedFilters = filters.mapManual(filters => filters.filter(filter => filter.id !== 'plaintext' || filter.token.lowercase.length >= 3))
		const appliedFilterText = appliedFilters.mapManual(filters => filters.map(filter => `"${config.value?.allowUppercase ? filter.token.slice() : filter.token.lowercase}"`).join(' '))

		let noPartialFiltersOwner: State.Owner.Removable | undefined
		const noPartialFilters = filters.mapManual(filters => {
			noPartialFiltersOwner?.remove(); noPartialFiltersOwner = State.Owner.create()
			return State.Map(noPartialFiltersOwner,
				filters.map(filter => State.get(filter.isPartial)),
				(...partialStates) => !partialStates.includes(true),
			)
		})

		const debounceFinished = State(true)
		let filterTextEditTimeout: number | undefined
		appliedFilterText.useManual(filterText => {
			debounceFinished.value = false
			clearTimeout(filterTextEditTimeout)
			filterTextEditTimeout = window.setTimeout(() => {
				debounceFinished.value = true
			}, config.value?.debounceTime ?? 200)
		})

		let oldFilterText = ''
		const debouncedFilterText = State.MapManual([appliedFilterText, noPartialFilters, debounceFinished], (filterText, noPartialFilters, debounceFinished) => {
			return oldFilterText = noPartialFilters || debounceFinished ? filterText : oldFilterText
		})

		function tokenise (filterText: string): FilterToken[] {
			const tokens: FilterToken[] = []

			let doubleQuote = false
			let tokenStart = 0
			let tokenEnd = 0
			for (let i = 0; i < filterText.length + 1; i++) {
				if (i === filterText.length)
					doubleQuote = false // end of string, reset double quote state

				const char = filterText[i] ?? ' '
				if (char === '"')
					doubleQuote = !doubleQuote

				const isSpace = !doubleQuote && (false
					|| char === ' '
					|| filterText.slice(i, i + EMOJI_SPACE_PLACEHOLDER.length) === EMOJI_SPACE_PLACEHOLDER
				)
				if (isSpace) {
					const spaceLength = char === ' ' ? 1 : EMOJI_SPACE_PLACEHOLDER.length
					if (tokenEnd === tokenStart) { // skip consecutive spaces
						tokenStart += spaceLength
						tokenEnd += spaceLength
						continue
					}

					const tokenText = filterText.slice(tokenStart, tokenEnd)
					tokens.push(FilterToken.create(tokenText, tokenStart, tokenEnd))
					tokenStart = tokenEnd = i + spaceLength // put new start after space
					continue
				}

				tokenEnd++ // extend current token by 1 char
			}

			return tokens
		}

		const selectedToken = State.MapManual([filters, caretPosition], (filters, caretPosition) => {
			if (caretPosition === undefined)
				return undefined

			for (const filter of filters)
				if (caretPosition >= filter.token.start && caretPosition <= filter.token.end)
					return filter.token

			return undefined
		})

		//#endregion
		////////////////////////////////////

		////////////////////////////////////
		//#region Input

		const input = Component('input')
			.attributes.set('type', 'text')
			.attributes.bind('placeholder', quilt.map(filter, quilt => quilt['display-bar/filter/placeholder']().toString()))
			.style('filter-input')
			.style.bind(component.hasFocused, 'filter-input--has-focus')
			.style.bind(filterText.truthy, 'filter-input--has-content')
			.event.subscribe('input', e =>
				filterText.value = e.host.element.value
			)
			.event.subscribe('selectionchange', e =>
				caretPosition.value = e.host.element.selectionStart === e.host.element.selectionEnd ? e.host.element.selectionStart ?? undefined : undefined
			)
			.appendTo(filter)

		function spliceInput (start: number, end: number, replacement: string, collapseLeft?: true) {
			const inputElement: HTMLInputElement = input.element

			const originalValue = inputElement.value
			let caretStart = inputElement.selectionStart
			let caretEnd = inputElement.selectionEnd
			const selectionDirection = inputElement.selectionDirection

			inputElement.value = originalValue.slice(0, start) + replacement + originalValue.slice(end)

			const delta = replacement.length - (end - start)

			const shiftRightPos = collapseLeft ? end + 1 : end
			caretStart = caretStart === null ? null : caretStart >= shiftRightPos ? caretStart + delta : Math.min(start, caretStart)
			caretEnd = caretEnd === null ? null : caretEnd >= shiftRightPos ? caretEnd + delta : Math.min(start, caretEnd)

			inputElement.setSelectionRange(caretStart, caretEnd, selectionDirection ?? undefined)
		}

		////////////////////////////////////
		//#region Hidden Emoji Spacing

		filters.use(input, filters => {
			for (let i = filters.length - 1; i >= 0; i--) {
				const filter = filters[i]
				const lastStart = filters[i + 1]?.token.start ?? input.element.value.length
				const textAfter = input.element.value.slice(filter.token.end, lastStart)
				for (const match of textAfter.matchAll(EMOJI_OR_WHITESPACE_REGEX).toArray().reverse()) {
					// ensure all whitespace between tokens is single ➕ characters
					const start = filter.token.end + (match.index ?? 0)
					const end = start + match[0].length
					spliceInput(start, end, EMOJI_SPACE_PLACEHOLDER)
				}

				for (const match of filter.token.matchAll(EMOJI_REGEX).toArray().reverse()) {
					// remove emojis from the token
					const start = filter.token.start + (match.index ?? 0)
					const end = start + match[0].length
					spliceInput(start, end, '')
				}

				if (filter.icon) {
					// insert a ⬛ emoji at the start of tokens with icon
					const start = filter.token.start
					spliceInput(start, start, EMOJI_ICON_PLACEHOLDER, true)
				}
			}

			// ensure the state is up to date with the emojis
			// (this won't infinitely recurse because the emojis will have already been corrected the first time)
			filterText.value = input.element.value
		})

		//#endregion
		////////////////////////////////////

		//#endregion
		////////////////////////////////////

		////////////////////////////////////
		//#region Filter Display

		Component()
			.style('filter-display')
			.tweak(wrapper => {
				interface FilterDisplaySpace {
					readonly type: 'space'
					readonly length: number
					component?: Component
				}
				interface FilterDisplayChip {
					readonly type: 'chip'
					readonly id: string
					readonly match: FilterMatch
					component?: Component
				}
				const displayData = filters.map(wrapper, filters => {
					const display: (FilterDisplaySpace | FilterDisplayChip)[] = []
					for (let i = 0; i < filters.length; i++) {
						const filter = filters[i]
						const lastEnd = filters[i - 1]?.token.end ?? 0
						const spaceLength = filter.token.start - lastEnd
						if (spaceLength)
							display.push({
								type: 'space',
								length: spaceLength,
							})

						display.push({
							type: 'chip',
							id: filter.id,
							match: filter,
						})
					}
					return display
				})

				displayData.use(wrapper, (newDisplayData, oldDisplayData = []) => {
					let n = 0
					let o = 0
					let lastComponent: Component | undefined
					NextNew: for (; n < newDisplayData.length; n++) {
						const newDisplayDataItem = newDisplayData[n]
						for (; o < oldDisplayData.length; o++) {
							const oldDisplayDataItem = oldDisplayData[o]
							const matches = newDisplayDataItem.type === 'chip' && oldDisplayDataItem.type === 'chip'
								? (newDisplayDataItem.id === oldDisplayDataItem.id
									&& newDisplayDataItem.match.token.slice() === oldDisplayDataItem.match.token.slice()
								)
								: newDisplayDataItem.type === 'space' && oldDisplayDataItem.type === 'space'
									? newDisplayDataItem.length === oldDisplayDataItem.length
									: false

							if (!matches) {
								oldDisplayDataItem.component?.remove()
								continue
							}

							o++
							lastComponent = oldDisplayDataItem.component
							newDisplayDataItem.component = oldDisplayDataItem.component
							continue NextNew
						}

						// this token didn't exist before, so create a new component for it
						switch (newDisplayDataItem.type) {
							case 'space':
								lastComponent = newDisplayDataItem.component = Component()
									.style('filter-display-space')
									.text.set(EMOJI_SPACE_PLACEHOLDER.repeat(newDisplayDataItem.length))
									.insertTo(wrapper, 'after', lastComponent)
								break
							case 'chip': {
								lastComponent = newDisplayDataItem.component = Chip(newDisplayDataItem.match)
									.insertTo(wrapper, 'after', lastComponent)
								break
							}
						}
					}

					// remove other components that have been removed
					const children = wrapper.getChildren().toArray()
					for (const child of children)
						if (!newDisplayData.some(item => item.component === child))
							child.remove()
				})
			})
			.appendTo(filter)

		//#endregion
		////////////////////////////////////

		////////////////////////////////////
		//#region Suggested Filters

		const popover = Popover()
			.style('filter-popover')
			.anchor.from(input)
			.anchor.add('aligned left', 'off top')
			.setCloseDueToMouseInputFilter(event => !filter.contains(event.targetComponent))
			.event.subscribe('click', e => e.host.focus())
			.appendTo(document.body)

		const mouseWithinPopover = State.Map(popover, [Mouse.state, popover.visible], (mouse, visible) => visible && popover.isMouseWithin())

		State.Some(popover, input.hasFocused, popover.hasFocused, mouseWithinPopover).subscribe(popover, async focused => {
			if (!focused) {
				if (InputBus.isDown('F4'))
					return

				popover.hide()
				return
			}

			popover.style.setProperty('width', `${input.element.offsetWidth}px`)
			popover.style.setProperty('visibility', 'hidden')
			popover.show()
			popover.focus()
			popover.style.removeProperties('left', 'top')
			await Task.yield()
			popover.anchor.apply()
			await Task.yield()
			popover.style.removeProperties('visibility')
		})

		Component()
			.style('filter-popover-title')
			.text.set(quilt => quilt['display-bar/filter/suggestions/title']())
			.appendTo(popover)

		DisplaySlot()
			.style('filter-popover-suggestions-wrapper')
			.use(config, (slot, config) => {
				for (const filter of config?.filters ?? []) {
					const suggestions = State.get(typeof filter.suggestions === 'function' ? filter.suggestions(slot) : filter.suggestions)
					Slot().appendTo(slot).use(suggestions, (slot, suggestions) => {
						const suggestionMatches = (Array.isArray(suggestions) ? suggestions : suggestions.all)
							.map((suggestion): FilterMatch | undefined => {
								const token = FilterToken.create(suggestion)
								const match = filter.match(slot, token)
								if (!match)
									return undefined

								return Object.assign(match, { token, id: filter.id })
							})
							.filter(NonNullish)

						for (const suggestion of suggestionMatches)
							Button()
								.tweak(button => button.textWrapper.remove())
								.and(Chip, suggestion)
								.style.remove('filter-display-chip')
								.style('filter-popover-suggestion')
								.tweak(chip => chip.textWrapper.style('filter-popover-suggestion-text-wrapper'))
								.append(Component().style('filter-popover-suggestion-colour-wrapper'))
								.event.subscribe('click', async e => {
									spliceInput(
										selectedToken.value?.start ?? caretPosition.value ?? 0,
										selectedToken.value?.end ?? caretPosition.value ?? 0,
										`${suggestion.token.lowercase} `,
									)
									filterText.value = input.element.value
									const selectionStart = input.element.selectionStart
									const selectionEnd = input.element.selectionEnd
									const selectionDirection = input.element.selectionDirection
									await Task.yield()
									input.focus()
									input.element.setSelectionRange(
										selectionStart,
										selectionEnd,
										selectionDirection ?? undefined
									)
								})
								.appendToWhen(
									State.Map(slot, [selectedToken, filterFullTexts], (selectedToken, filters) => {
										const lowercase = suggestion.token.lowercase
										return true
											// this suggestion isn't already something we're filtering by
											&& !filters.includes(lowercase)
											// ensure the suggestion matches the current filter text
											&& (!selectedToken || lowercase.startsWith(selectedToken.lowercase))
											// ensure the suggestion matches the filter provided
											&& (Array.isArray(suggestions) ? true : suggestions.filter?.(lowercase, selectedToken, filters) ?? true)
									}),
									slot
								)
					})
				}
			})
			.appendTo(popover)

		//#endregion
		////////////////////////////////////

		return filter.extend<FilterExtensions>(filter => ({
			input,
			filterText: debouncedFilterText,
			config,
			filter: (item, showIrrelevant) => {
				const parsedFilters = appliedFilters.value
				if (!parsedFilters.length)
					return true

				const groupedFilters = Object.groupBy(parsedFilters, filter => filter.id)
				for (const [filterId, filters] of Object.entries(groupedFilters)) {
					if (!filters)
						continue

					const type = config.value?.filters.find(filter => filter.id === filterId)?.type ?? 'and'
					switch (type) {
						case 'and':
							for (const filter of filters) {
								const result = filter.filter(item, filter.token)
								if (!result || (!showIrrelevant && result === 'irrelevant'))
									return false
							}
							break
						case 'or': {
							let hasMatch = false
							for (const filter of filters) {
								const result = filter.filter(item, filter.token)
								if (result === true || (result === 'irrelevant' && showIrrelevant)) {
									hasMatch = true
									break
								}
							}
							if (!hasMatch)
								return false
						}
					}
				}

				return true
			},
		}))
	}),
	{
		Definition (definition: Filter.Definition): Filter.Definition {
			return definition
		},
	},
)

export default Filter

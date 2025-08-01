import type { Item } from 'conduit.deepsight.gg/Collections'
import { Component, State } from 'kitsui'
import type TextManipulator from 'kitsui/utility/TextManipulator'
import { quilt } from 'utility/Text'

// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
interface FilterToken extends String {
	readonly lowercase: string
	readonly displayText: string
	readonly start: number
	readonly end: number
}

interface FilterFunction {
	filter (item: Item, token: FilterToken): boolean
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
	readonly labelWrapper: Component
	readonly labelText: TextManipulator<this>
	readonly textWrapper: Component
}

interface FilterExtensions {
	readonly input: Component
	readonly filterText: State<string>
	readonly config: State.Mutable<Filter.Config | undefined>
	filter (item: Item): boolean
}

interface Filter extends Component, FilterExtensions { }

namespace Filter {
	export interface Config {
		readonly id: string
		readonly filters: Filter.Definition[]
	}

	export interface Definition {
		readonly id: string
		match (owner: State.Owner, token: FilterToken): FilterFunction | undefined
	}

	export interface Chip extends Component, FilterChipExtensions { }
}

const PLAINTEXT_FILTER_FUNCTION: FilterFunction['filter'] = (item, token) => item.displayProperties.name.toLowerCase().includes(token.lowercase)
const PLAINTEXT_FILTER_TWEAK_CHIP: FilterFunction['chip'] = (chip, token) => chip/* .style.remove('filter-display-chip')*/.style('filter-display-text')

const EMOJI_ICON_PLACEHOLDER = '⬛'
const EMOJI_REGEX = /[\p{Emoji}\p{Extended_Pictographic}]/gu
const EMOJI_SPACE_PLACEHOLDER = '–'
const EMOJI_OR_WHITESPACE_REGEX = /[– ]+/gu

const Filter = Object.assign(
	Component((component): Filter => {
		const filter = component.style('filter')

		const config = State<Filter.Config | undefined>(undefined)

		let filtersOwner: State.Owner.Removable | undefined
		const filterText = State('')

		////////////////////////////////////
		//#region Filter Parsing

		const filters = State.Map(filter, [filterText, config], (text, config) => {
			filtersOwner?.remove(); filtersOwner = State.Owner.create()
			text = text.toLowerCase()

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
					token,
					filter: PLAINTEXT_FILTER_FUNCTION,
					chip: PLAINTEXT_FILTER_TWEAK_CHIP,
				})
			}

			return filters
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
					tokens.push(Object.assign(String(tokenText), {
						lowercase: (tokenText
							.toLowerCase()
							.replace(/["\p{Emoji}\p{Extended_Pictographic}]/gu, '')
						),
						displayText: (tokenText
							.replaceAll(' ', '\xa0')
							.replace(EMOJI_REGEX, '')
						),
						start: tokenStart,
						end: tokenEnd,
					}))
					tokenStart = tokenEnd = i + spaceLength // put new start after space
					continue
				}

				tokenEnd++ // extend current token by 1 char
			}

			return tokens
		}

		//#endregion
		////////////////////////////////////

		const input = Component('input')
			.attributes.set('type', 'text')
			.attributes.bind('placeholder', quilt.map(filter, quilt => quilt['display-bar/filter/placeholder']().toString()))
			.style('filter-input')
			.style.bind(component.hasFocused, 'filter-input--has-focus')
			.style.bind(filterText.truthy, 'filter-input--has-content')
			.event.subscribe('input', e => filterText.value = e.host.element.value)
			.appendTo(filter)

		////////////////////////////////////
		//#region Hidden Emoji Spacing

		filters.use(input, filters => {
			for (let i = filters.length - 1; i >= 0; i--) {
				const filter = filters[i]
				const lastStart = filters[i + 1]?.token.start ?? input.element.value.length
				const textAfter = input.element.value.slice(filter.token.end, lastStart)
				for (const match of textAfter.matchAll(EMOJI_OR_WHITESPACE_REGEX).toArray().reverse()) {
					// ensure all whitespace between tokens is single ➕ characters
					const inputElement: HTMLInputElement = input.element
					const start = filter.token.end + (match.index ?? 0)
					const end = start + match[0].length
					let caretStart = inputElement.selectionStart
					let caretEnd = inputElement.selectionEnd
					const selectionDirection = inputElement.selectionDirection
					inputElement.value = inputElement.value.slice(0, start) + EMOJI_SPACE_PLACEHOLDER + inputElement.value.slice(end)
					caretStart = caretStart === null ? null : caretStart >= end ? caretStart + EMOJI_SPACE_PLACEHOLDER.length - (end - start) : Math.min(start, caretStart)
					caretEnd = caretEnd === null ? null : caretEnd >= end ? caretEnd + EMOJI_SPACE_PLACEHOLDER.length - (end - start) : Math.min(start, caretEnd)
					inputElement.setSelectionRange(caretStart, caretEnd, selectionDirection ?? undefined)
				}

				for (const match of filter.token.matchAll(EMOJI_REGEX).toArray().reverse()) {
					// remove emojis from the token
					const inputElement: HTMLInputElement = input.element
					const start = filter.token.start + (match.index ?? 0)
					const end = start + match[0].length
					const value = inputElement.value
					let caretStart = inputElement.selectionStart
					let caretEnd = inputElement.selectionEnd
					const selectionDirection = inputElement.selectionDirection
					inputElement.value = value.slice(0, start) + value.slice(end)
					caretStart = caretStart === null ? null : caretStart > start ? caretStart - (end - start) : caretStart
					caretEnd = caretEnd === null ? null : caretEnd > start ? caretEnd - (end - start) : caretEnd
					inputElement.setSelectionRange(caretStart, caretEnd, selectionDirection ?? undefined)
				}

				if (filter.icon) {
					// insert a ⬛ emoji at the start of tokens with icon
					const inputElement: HTMLInputElement = input.element
					const start = filter.token.start
					const value = inputElement.value
					let caretStart = inputElement.selectionStart
					let caretEnd = inputElement.selectionEnd
					const selectionDirection = inputElement.selectionDirection
					inputElement.value = value.slice(0, start) + EMOJI_ICON_PLACEHOLDER + value.slice(start)
					caretStart = caretStart === null ? null : caretStart > start ? caretStart + EMOJI_ICON_PLACEHOLDER.length : caretStart
					caretEnd = caretEnd === null ? null : caretEnd > start ? caretEnd + EMOJI_ICON_PLACEHOLDER.length : caretEnd
					inputElement.setSelectionRange(caretStart, caretEnd, selectionDirection ?? undefined)
				}
			}

			// ensure the state is up to date with the emojis
			// (this won't infinitely recurse because the emojis will have already been corrected the first time)
			filterText.value = input.element.value
		})

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
					const children = wrapper.getChildren().toArray()
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
								const filterMatch = newDisplayDataItem.match

								const iconWrapper = filterMatch.icon && Component()
									.style('filter-display-chip-icon-wrapper')

								const iconPlaceholder = iconWrapper && Component()
									.style('filter-display-chip-icon-placeholder')
									.text.set(EMOJI_ICON_PLACEHOLDER)
									.appendTo(iconWrapper)

								const icon = iconWrapper && Component()
									.style('filter-display-chip-icon', `filter-display-chip-icon--${newDisplayDataItem.id}` as 'filter-display-chip-icon')
									.tweak(icon => typeof filterMatch.icon === 'function' && filterMatch.icon(icon, filterMatch.token))
									.appendTo(iconWrapper)

								const textWrapper = Component()
									.style('filter-display-chip-text-wrapper')

								Component()
									.style('filter-display-chip-text-placeholder')
									.text.set(filterMatch.token.displayText)
									.appendTo(textWrapper)

								const labelText = Component()
									.style('filter-display-chip-text-label')
									.appendTo(textWrapper)

								const filterText = Component()
									.style('filter-display-chip-text-main')
									.text.set(filterMatch.token.displayText)
									.appendTo(textWrapper)

								lastComponent = newDisplayDataItem.component = Component()
									.style('filter-display-chip', `filter-display-chip--${newDisplayDataItem.id}` as 'filter-display-chip')
									.append(iconWrapper, textWrapper)
									.extend<FilterChipExtensions>(chip => ({
										iconWrapper,
										iconPlaceholder,
										icon,
										labelWrapper: labelText,
										labelText: labelText.text.rehost(chip),
										textWrapper: filterText,
									}))
									.extendJIT('text', chip => filterText.text.rehost(chip))
									.tweak(chip => filterMatch.chip?.(chip, filterMatch.token))
									.insertTo(wrapper, 'after', lastComponent)
								break
							}
						}
					}

					// remove unneeded components off the end
					for (let r = children.length - 1; r >= n; r--)
						children[r].remove()
				})
			})
			.appendTo(filter)

		//#endregion
		////////////////////////////////////

		return filter.extend<FilterExtensions>(filter => ({
			input,
			filterText,
			config,
			filter: item => {
				const parsedFilters = filters.value
				if (!parsedFilters.length)
					return true

				for (const filter of parsedFilters)
					if (!filter.filter(item, filter.token))
						return false

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

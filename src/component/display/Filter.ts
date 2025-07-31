import type { Item } from 'conduit.deepsight.gg/Collections'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import { quilt } from 'utility/Text'

interface FilterFunction {
	filter (item: Item, token: Token): boolean
	chip?(chip: Component, token: Token): unknown
	icon?: true | ((icon: Component, token: Token) => unknown)
}
interface ParsedFilter extends FilterFunction {
	readonly id: string
	readonly token: Token
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
		match (owner: State.Owner, token: Token): FilterFunction | undefined
	}
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
		const filters = State.Map(filter, [filterText, config], (text, config) => {
			filtersOwner?.remove(); filtersOwner = State.Owner.create()
			text = text.toLowerCase()

			const tokens = tokenise(text)
			if (tokens.length === 0)
				return []

			const filters: ParsedFilter[] = []
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

		const input = Component('input')
			.attributes.set('type', 'text')
			.attributes.bind('placeholder', quilt.map(filter, quilt => quilt['display-bar/filter/placeholder']().toString()))
			.style('filter-input')
			.style.bind(component.hasFocused, 'filter-input--has-focus')
			.style.bind(filterText.truthy, 'filter-input--has-content')
			.event.subscribe('input', e => filterText.value = e.host.element.value)
			.appendTo(filter)

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

		Slot().tweak(slot => slot.useDisplayContents.value = false).style('filter-display').appendTo(filter).use(filters, (slot, filters) => {
			for (let i = 0; i < filters.length; i++) {
				const filter = filters[i]
				const lastEnd = filters[i - 1]?.token.end ?? 0
				const diff = filter.token.start - lastEnd
				slot.append(Component().style('filter-display-space').text.set(EMOJI_SPACE_PLACEHOLDER.repeat(diff)))
				slot.append(Component()
					.style('filter-display-chip', `filter-display-chip--${filter.id}` as 'filter-display-chip')
					.append(filter.icon && Component()
						.style('filter-display-chip-icon-wrapper')
						.append(Component().style('filter-display-chip-icon-placeholder').text.set(EMOJI_ICON_PLACEHOLDER))
						.append(Component()
							.style('filter-display-chip-icon', `filter-display-chip-icon--${filter.id}` as 'filter-display-chip-icon')
							.tweak(icon => typeof filter.icon === 'function' && filter.icon(icon, filter.token))
						)
					)
					.append(Component()
						.text.set(filter.token
							.replaceAll(' ', '\xa0')
							.replace(EMOJI_REGEX, '')
						)
					)
					.tweak(chip => filter.chip?.(chip, filter.token))
				)
			}
		})

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

// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
interface Token extends String {
	readonly lowercase: string
	readonly start: number
	readonly end: number
}
function tokenise (filterText: string): Token[] {
	const tokens: Token[] = []

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

import Details from 'component/core/Details'
import type { State } from 'kitsui'
import { Component } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import InputBus from 'kitsui/utility/InputBus'
import Task from 'kitsui/utility/Task'
import Arrays from 'utility/Arrays'

const JSON = Component.Tag()

const JSONPunctuation = Component((component, punctuationString: string) => component.and(JSON)
	.style('data-overlay-json-punctuation')
	.text.set(punctuationString)
)

const JSONPlaceholder = Component((component, text: string) => component.and(JSON)
	.style('data-overlay-json-placeholder')
	.text.set(text)
)

const JSONCopyPaste = Component('input', (component, value: string | number) => component.and(JSON)
	.replaceElement('input')
	.style('data-overlay-json-copypaste')
	.attributes.set('readonly', 'true')
	.tweak(input => {
		const string = `${value}`
		input.element.value = string
		input.style.setVariable('chars', string.length)
	})
	.event.subscribe('mousedown', e => {
		const input = e.host
		if (document.activeElement !== input.element) {
			void Task.yield().then(() => input.element.select())
		}
	})
	.event.subscribe('blur', e => {
		window.getSelection()?.removeAllRanges()
	})
)

interface JSONContainerExtensions {
	readonly key: Component
	readonly path: (string | number)[]
}

interface JSONContainer extends Details, JSONContainerExtensions { }

const JSONContainer = Component((component, key: string | number | Component | Component[], value: any, path: (string | number)[]): JSONContainer => {
	const valueComponent = JSONValue(value, path)
	const expandable = valueComponent.as(JSONObject) ?? valueComponent.as(JSONArray)

	const pathString = path.join('/')
	const highlighted = navigate.hash.equals(`#${pathString}`)

	let container: JSONContainer
	const keyComponent = Component('a')
		.style('data-overlay-json-container-key')
		.attributes.set('href', `#${pathString}`)
		.append(...typeof key === 'object' ? Arrays.resolve(key) : [])
		.text.append(typeof key !== 'object' ? `${key}` : '')
		.event.subscribe('click', e => {
			if (e.targetComponent?.is(JSONCopyPaste))
				return

			e.preventDefault()
			container.open.value = !container.open.value
		})

	return container = component.and(Details).and(JSON)
		.style('data-overlay-json-container-entry')
		.tweak(details => details.summary
			.style('data-overlay-json-container-entry-summary')
			.style.toggle(!expandable, 'data-overlay-json-container-entry-summary--simple')
			.append(keyComponent)
			.append(JSONPunctuation(':'))
			.text.append(' ')
			.append(expandable ? undefined : valueComponent)
			.append(!expandable ? undefined : (expandable.is(JSONObject)
				? JSONPlaceholder(`{} ${expandable.size} ${expandable.size === 1 ? 'entry' : 'entries'}`)
				: JSONPlaceholder(`[] ${expandable.length} ${expandable.length === 1 ? 'item' : 'items'}`))
			)
			.event.subscribe('click', e => {
				if (e.targetComponent?.is(JSONCopyPaste))
					e.preventDefault()
			})
		)
		.tweak(details => details.content
			.append(Component()
				.style('data-overlay-json-container-expandable')
				.append(expandable)
			)
		)
		.onRooted(() => {
			highlighted.use(keyComponent, highlighted => {
				if (!highlighted)
					return

				const jsonRoot = container.getAncestorComponents(JSON).toArray().at(-1)
				for (const container of jsonRoot?.getDescendants(JSONContainer) ?? []) {
					container.open.value = false
					container.key.style.remove('data-overlay-json-container-key--highlighted')
				}

				container.key.style('data-overlay-json-container-key--highlighted')
				container.open.value = true
				for (const ancestorContainer of container.getAncestorComponents(JSONContainer)) {
					ancestorContainer.key.style('data-overlay-json-container-key--highlighted')
					ancestorContainer.open.value = true
				}
			})
		})
		.extend<JSONContainerExtensions>(container => ({
			key: keyComponent,
			path,
		}))
})

interface JSONObjectExtensions {
	readonly size: number
}

interface JSONObject extends Component, JSONObjectExtensions { }

const JSONObject = Component((component, object: object, path?: (string | number)[]): JSONObject => {
	component.style('data-overlay-json', 'data-overlay-json-object')
	const entries = Object.entries(object)
	for (const [key, value] of entries) {
		JSONContainer(key, value, [...path ?? [], key])
			.tweak(container => container.key.style('data-overlay-json-object-key'))
			.appendTo(component)
	}
	return component.and(JSON).extend<JSONObjectExtensions>(obj => ({
		size: entries.length,
	}))
})

interface JSONArrayExtensions {
	readonly length: number
}

interface JSONArray extends Component, JSONArrayExtensions { }

const JSONArray = Component((component, array: any[], path?: (string | number)[]): JSONArray => {
	component.style('data-overlay-json', 'data-overlay-json-array')
	for (let i = 0; i < array.length; i++) {
		JSONContainer([JSONPunctuation('['), JSONNumber(i), JSONPunctuation(']')], array[i], [...path ?? [], i])
			.tweak(container => container.key.style('data-overlay-json-array-index'))
			.appendTo(component)
	}
	return component.and(JSON).extend<JSONArrayExtensions>(arr => ({
		length: array.length,
	}))
})

const JSONString = Component((component, string: string) => component.and(JSON)
	.style('data-overlay-json', 'data-overlay-json-string')
	.append(JSONPunctuation('"'))
	.append(string && JSONCopyPaste(string).style('data-overlay-json-string-value'))
	.append(JSONPunctuation('"'))
)

const JSONNumber = Component((component, number: number) => component.and(JSON)
	.style('data-overlay-json', 'data-overlay-json-number')
	.append(JSONCopyPaste(number))
)

const JSONBool = Component((component, bool: boolean) => component.and(JSON)
	.style('data-overlay-json', 'data-overlay-json-boolean')
	.text.set(bool ? 'true' : 'false')
)

const JSONNull = Component(component => component.and(JSON)
	.style('data-overlay-json', 'data-overlay-json-null')
	.text.set('null')
)

const JSONValue = (value: unknown, path?: (string | number)[]) => {
	if (typeof value === 'string')
		return JSONString(value)

	if (typeof value === 'number')
		return JSONNumber(value)

	if (typeof value === 'boolean')
		return JSONBool(value)

	if (Array.isArray(value))
		return JSONArray(value, path)

	if (value === null)
		return JSONNull()

	return JSONObject(value as object, path)
}

export default Component((component, definition: State<object | undefined>) => {
	component.style('data-overlay')

	Slot()
		.use(definition, (s, def) => def && JSONValue(def))
		.appendTo(component)

	InputBus.event.until(component, event => event.subscribe('Down', (_, event) => {
		if (event.use('Escape')) {
			void navigate.toURL('/data')
		}
	}))

	return component
})

import Details from 'component/core/Details'
import type { State } from 'kitsui'
import { Component } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import InputBus from 'kitsui/utility/InputBus'
import Task from 'kitsui/utility/Task'

const JSONPunctuation = Component((component, punctuationString: string) => component
	.style('data-overlay-json-punctuation')
	.text.set(punctuationString)
)

const JSONPlaceholder = Component((component, text: string) => component
	.style('data-overlay-json-placeholder')
	.text.set(text)
)

const JSONCopyPaste = Component('input', (component, value: string | number) => component
	.replaceElement('input')
	.style('data-overlay-json-copypaste')
	.attributes.set('readonly', 'true')
	.tweak(input => {
		const string = `${value}`
		input.element.value = string
		input.element.size = Math.max(1, string.length - 1)
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
}

interface JSONContainer extends Details, JSONContainerExtensions { }

const JSONContainer = Component((component, key: string | number, value: any): JSONContainer => {
	const valueComponent = JSONValue(value)
	const expandable = valueComponent.as(JSONObject) ?? valueComponent.as(JSONArray)
	const keyComponent = Component()
		.style('data-overlay-json-object-key')
		.text.set(`${key}`)
	return component.and(Details)
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
		)
		.tweak(details => details.content
			.append(Component()
				.style('data-overlay-json-container-expandable')
				.append(expandable)
			)
		)
		.extend<JSONContainerExtensions>(container => ({
			key: keyComponent,
		}))
})

interface JSONObjectExtensions {
	readonly size: number
}

interface JSONObject extends Component, JSONObjectExtensions { }

const JSONObject = Component((component, object: object): JSONObject => {
	component.style('data-overlay-json', 'data-overlay-json-object')
	const entries = Object.entries(object)
	for (const [key, value] of entries) {
		JSONContainer(key, value)
			.tweak(container => container.key.style('data-overlay-json-object-key'))
			.appendTo(component)
	}
	return component.extend<JSONObjectExtensions>(obj => ({
		size: entries.length,
	}))
})

interface JSONArrayExtensions {
	readonly length: number
}

interface JSONArray extends Component, JSONArrayExtensions { }

const JSONArray = Component((component, array: any[]): JSONArray => {
	component.style('data-overlay-json', 'data-overlay-json-array')
	for (let i = 0; i < array.length; i++) {
		JSONContainer(i, array[i])
			.tweak(container => container.key.style('data-overlay-json-array-index'))
			.appendTo(component)
	}
	return component.extend<JSONArrayExtensions>(arr => ({
		length: array.length,
	}))
})

const JSONString = Component((component, string: string) => component
	.style('data-overlay-json', 'data-overlay-json-string')
	.append(JSONPunctuation('"'))
	.append(string && JSONCopyPaste(string).style('data-overlay-json-string-value'))
	.append(JSONPunctuation('"'))
)

const JSONNumber = Component((component, number: number) => component
	.style('data-overlay-json', 'data-overlay-json-number')
	.append(JSONCopyPaste(number))
)

const JSONBool = Component((component, bool: boolean) => component
	.style('data-overlay-json', 'data-overlay-json-boolean')
	.text.set(bool ? 'true' : 'false')
)

const JSONNull = Component(component => component
	.style('data-overlay-json', 'data-overlay-json-null')
	.text.set('null')
)

const JSONValue = (value: unknown) => {
	if (typeof value === 'string')
		return JSONString(value)

	if (typeof value === 'number')
		return JSONNumber(value)

	if (typeof value === 'boolean')
		return JSONBool(value)

	if (Array.isArray(value))
		return JSONArray(value)

	if (value === null)
		return JSONNull()

	return JSONObject(value as object)
}

export default Component((component, definition: State<object | undefined>) => {
	component.style('data-overlay')

	Slot()
		.use(definition, (s, def) => def && JSONObject(def))
		.appendTo(component)

	InputBus.event.until(component, event => event.subscribe('Down', (_, event) => {
		if (event.use('Escape')) {
			void navigate.toURL('/data')
		}
	}))

	return component
})

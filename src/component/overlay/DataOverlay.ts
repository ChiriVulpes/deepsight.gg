import Details from 'component/core/Details'
import type { State } from 'kitsui'
import { Component } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import InputBus from 'kitsui/utility/InputBus'

const JSONPunctuation = Component((component, punctuationString: string) => component
	.style('data-overlay-json-punctuation')
	.text.set(punctuationString)
)

const JSONObject = Component((component, object: object) => {
	component.style('data-overlay-json', 'data-overlay-json-object')
	for (const [key, value] of Object.entries(object)) {
		const valueComponent = JSONValue(value)
		const expandable = valueComponent.as(JSONObject) ?? valueComponent.as(JSONArray)
		Details()
			.style('data-overlay-json-object-entry')
			.tweak(details => details.summary
				.style('data-overlay-json-object-entry-summary')
				.style.toggle(!expandable, 'data-overlay-json-object-entry-summary--simple')
				.append(Component()
					.style('data-overlay-json-object-key')
					.text.set(key)
				)
				.append(JSONPunctuation(':'))
				.append(expandable ? undefined : valueComponent)
			)
			.tweak(details => details.content
				.append(Component()
					.style('data-overlay-json-object-expandable')
					.append(expandable)
				)
			)
			.appendTo(component)
	}
	return component
})

const JSONArray = Component((component, array: any[]) => {
	component.style('data-overlay-json', 'data-overlay-json-array')
	for (let i = 0; i < array.length; i++) {
		const valueComponent = JSONValue(array[i])
		const expandable = valueComponent.as(JSONObject) ?? valueComponent.as(JSONArray)
		Details()
			.style('data-overlay-json-array-entry')
			.tweak(details => details.summary
				.style('data-overlay-json-array-entry-summary')
				.style.toggle(!expandable, 'data-overlay-json-array-entry-summary--simple')
				.append(Component()
					.style('data-overlay-json-array-index')
					.text.set(`${i}`)
				)
				.append(JSONPunctuation(':'))
				.append(expandable ? undefined : valueComponent)
			)
			.tweak(details => details.content
				.append(Component()
					.style('data-overlay-json-array-expandable')
					.append(expandable)
				)
			)
			.appendTo(component)
	}
	return component
})

const JSONString = Component((component, string: string) => component
	.style('data-overlay-json', 'data-overlay-json-string')
	.append(JSONPunctuation('"'))
	.append(Component()
		.style('data-overlay-json-string-value')
		.text.set(string)
	)
	.append(JSONPunctuation('"'))
)

const JSONNumber = Component((component, number: number) => component
	.style('data-overlay-json', 'data-overlay-json-number')
	.text.set(`${number}`)
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

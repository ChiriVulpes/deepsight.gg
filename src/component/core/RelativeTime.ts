import { Component, State } from 'kitsui'
import Time from 'utility/Time'

const RelativeTime = Component((component, timeIn: State.Or<number | string | undefined>) => {
	const time = State.get(timeIn)
	return component
		.text.bind(State.Map(component, [Time.state, time], (_, time) => {
			const ms = typeof time === 'string' ? Date.parse(time) : time
			return ms === undefined || Number.isNaN(ms) ? undefined : Time.relative(ms, { components: 1 })
		}))
})

export default RelativeTime

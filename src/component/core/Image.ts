import { Component, State } from 'kitsui'
import Task from 'kitsui/utility/Task'

export default Component('img', (component, src: State.Or<string>) => {
	src = State.get(src)
	return component.replaceElement('img')
		.style('image')
		.tweak(image => {
			let abort: AbortController | undefined
			src.use(image, async src => {
				abort?.abort()

				abort = new AbortController()
				const signal = abort.signal
				component.attributes.remove('src')
				component.style.remove('image--loaded')

				await Task.yield()
				if (signal.aborted)
					return

				component.attributes.set('src', src)
			})
		})
		.event.subscribe('load', () => {
			component.style('image--loaded')
		})
})

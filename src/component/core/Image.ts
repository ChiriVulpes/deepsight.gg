import { Component, State } from 'kitsui'
import Task from 'kitsui/utility/Task'

interface ImageDimensions {
	width: number
	height: number
}

interface ImageExtensions {
	readonly state: State<string | undefined>
	readonly dimensions: State<ImageDimensions | undefined>
}

interface Image extends Component<HTMLImageElement>, ImageExtensions { }

export default Component('img', (component, src: State.Or<string | undefined>, fallback?: string): Image => {
	src = State.get(src)
	const state = State<string | undefined>(undefined)
	const dimensions = State<ImageDimensions | undefined>(undefined)
	return component.replaceElement('img')
		.style('image')
		.tweak(image => {
			let abort: AbortController | undefined
			src.use(image, async src => {
				abort?.abort()

				if (component.attributes.has('src')) {
					abort = new AbortController()
					const signal = abort.signal
					component.attributes.remove('src')
					component.style.remove('image--loaded')
					state.value = undefined
					dimensions.value = undefined

					await Task.yield()
					if (signal.aborted)
						return
				}

				component.attributes.set('src', src)
				state.value = undefined
				dimensions.value = undefined
			})

			image.event.subscribe('load', () => {
				image.style('image--loaded')
				state.value = image.element.src

				if (image.element.src !== fallback)
					dimensions.value = {
						width: image.element.naturalWidth,
						height: image.element.naturalHeight,
					}
			})
			image.event.subscribe('error', () => {
				component.attributes.set('src', fallback)
				state.value = undefined
				dimensions.value = undefined
			})
		})
		.extend<ImageExtensions>(image => ({
			state,
			dimensions,
		}))
})

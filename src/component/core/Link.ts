import { Component, State } from 'kitsui'
import type { RoutePath } from 'navigation/RoutePath'

interface LinkExtensions {
	readonly href: State.Mutable<string>
	navigate (): Promise<void>
}

interface Link extends Component<HTMLAnchorElement>, LinkExtensions { }

const Link = Component('a', (component, hrefIn: RoutePath): Link => {
	const href = State(hrefIn)
	return component
		.replaceElement('a')
		.attributes.bind('href', href)
		.extend<LinkExtensions>(link => ({
			href,
			navigate () {
				return navigate.toURL(href.value)
			},
		}))
		.onRooted(link => {
			link.event.subscribe('click', event => {
				event.preventDefault()
				void link.navigate()
			})
		})
})

export default Link

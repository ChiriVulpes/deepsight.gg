import { Component, State } from 'kitsui'
import type { RoutePath } from 'navigation/RoutePath'

interface LinkExtensions {
	readonly href: State.Mutable<RoutePath>
	readonly overrideClick: State.Mutable<boolean>
	navigate (): Promise<void>
}

interface Link extends Component<HTMLAnchorElement>, LinkExtensions { }

const Link = Component('a', (component, hrefIn: State.Or<RoutePath>): Link => {
	const href = State<RoutePath>('/')
	href.bind(component, State.get(hrefIn))
	const overrideClick = State(true)
	return component
		.replaceElement('a')
		.attributes.bind('href', href)
		.extend<LinkExtensions>(link => ({
			href,
			overrideClick,
			navigate () {
				return navigate.toURL(href.value)
			},
		}))
		.onRooted(link => {
			link.event.subscribe('click', event => {
				if (!link.overrideClick.value)
					return

				event.preventDefault()
				void link.navigate()
			})
		})
})

export default Link

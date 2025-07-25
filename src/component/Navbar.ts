import Link from 'component/core/Link'
import WordmarkLogo from 'component/WordmarkLogo'
import { Component, State } from 'kitsui'

interface NavbarExtensions {
	readonly visible: State.Mutable<boolean>
	readonly viewTransitionsEnabled: State.Mutable<boolean>
}

interface Navbar extends Component, NavbarExtensions { }

const Navbar = Component('nav', (component): Navbar => {
	const visible = State(false)
	const viewTransitionsEnabled = State(false)

	const homelink = Link('/')
		.and(WordmarkLogo)
		.style('navbar-homelink')

	viewTransitionsEnabled.use(component, enabled => {
		homelink.viewTransition(enabled && 'wordmark-logo-home-link')
	})

	return component.style('navbar')
		.append(homelink)
		.extend<NavbarExtensions>(navbar => ({
			visible,
			viewTransitionsEnabled,
		}))
		.appendToWhen(visible, Component.getBody())
})

export default Navbar

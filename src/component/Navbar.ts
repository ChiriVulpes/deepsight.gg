import Link from 'component/core/Link'
import ProfileButton from 'component/profile/ProfileButton'
import WordmarkLogo from 'component/WordmarkLogo'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import Profile from 'model/Profile'

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
		.appendTo(component)

	Slot()
		.appendTo(component)
		.use(Profile.STATE, (slot, profiles) => profiles.selected
			&& ProfileButton(profiles.selected)
				.style('navbar-profile-button')
				.tweak(button => button.mode.setValue('simple'))
		)

	viewTransitionsEnabled.use(component, enabled => {
		homelink.viewTransition(enabled && 'wordmark-logo-home-link')
	})

	return component.style('navbar')
		.extend<NavbarExtensions>(navbar => ({
			visible,
			viewTransitionsEnabled,
		}))
		.appendToWhen(visible, Component.getBody())
})

export default Navbar

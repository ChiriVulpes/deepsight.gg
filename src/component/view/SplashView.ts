import Button from 'component/core/Button'
import Footer from 'component/core/Footer'
import Loading from 'component/core/Loading'
import View from 'component/core/View'
import ProfileButton from 'component/profile/ProfileButton'
import WordmarkLogo from 'component/WordmarkLogo'
import { Component, State } from 'kitsui'
import Relic from 'Relic'

export default Component((component): View => {
	const view = component.and(View)

	const loaded = State(false)

	Component('a')
		.and(WordmarkLogo)
		.attributes.set('href', location.origin)
		.appendToWhen(loaded.falsy, component)

	Loading().appendTo(component).set(
		async (signal, setProgress) => {
			setProgress(null, quilt => quilt['view/splash/load/connecting']())
			const conduit = await Relic.connected
			if (signal.aborted)
				return {}

			setProgress(null, quilt => quilt['view/splash/load/profiles']())
			const profiles = await conduit.getProfiles()
			return { conduit, profiles }
		},
		(slot, { conduit, profiles }) => {
			if (!conduit)
				return

			if (!profiles?.length) {
				const footer = Footer().appendTo(slot)
				Button()
					.text.set(quilt => quilt['view/splash/action/authenticate']())
					.event.subscribe('click', async () => {
						await conduit.ensureAuthenticated('deepsight.gg')
						slot.refresh()
					})
					.appendTo(footer)
			}
			else {
				for (const profile of profiles)
					ProfileButton(profile)
						.tweak(button => button.expanded.setValue(!!profile.authed))
						.appendTo(slot)
			}
		},
	)

	return view
})

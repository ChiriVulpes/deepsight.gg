import Button from 'component/core/Button'
import BaseCard from 'component/core/Card'
import Loading from 'component/core/Loading'
import View from 'component/core/View'
import ProfileButton from 'component/profile/ProfileButton'
import WordmarkLogo from 'component/WordmarkLogo'
import { Component } from 'kitsui'
import Relic from 'Relic'

export default Component((component): View => {
	const view = component.and(View)
		.style('splash-view')

	const loading = Loading()

	view.style.bind(loading.loaded, 'splash-view--ready')

	Component('a')
		.and(WordmarkLogo)
		.attributes.set('href', location.origin)
		.appendTo(Component()
			.style('splash-view-wordmark')
			.style.bind(loading.loaded, 'splash-view-wordmark--ready')
			.viewTransition('splash-view-wordmark')
			.appendTo(view)
		)

	loading.appendTo(component)
		.set(
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

				const authed = profiles.some(profile => profile.authed)

				const cards = Component().style('splash-view-cards').appendTo(slot)

				const Card = () => BaseCard()
					.style('splash-view-card')
					.viewTransitionSwipe('splash-view-card')
					.tweak(card => card.flush.value = true)
					.appendTo(cards)

				const profileCard = Card()
				profileCard.headerText.set(quilt => quilt['view/splash/profile-card/title']())
				profileCard.descriptionText.set(quilt => quilt['view/splash/profile-card/description']())

				if (!authed) {
					Button()
						.text.set(quilt => quilt['view/splash/action/authenticate']())
						.event.subscribe('click', async () => {
							await conduit.ensureAuthenticated('deepsight.gg')
							slot.refresh()
						})
						.appendTo(profileCard)
				}

				if (profiles.length) {
					const profilesList = Component()
						.style('splash-view-profile-list')
						.appendTo(profileCard)

					for (const profile of profiles)
						ProfileButton(profile)
							.tweak(button => button.expanded.setValue(!!profile.authed))
							.appendTo(profilesList)
				}

				const collectionsCard = Card()
				collectionsCard.headerText.set(quilt => quilt['view/splash/collections-card/title']())
				collectionsCard.descriptionText.set(quilt => quilt['view/splash/collections-card/description']())

				Component('a')
					.and(Button)
					.text.set(quilt => quilt['view/splash/collections-card/action/view']())
					.appendTo(collectionsCard)
			},
		)

	return view
})

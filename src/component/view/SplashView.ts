import Button from 'component/core/Button'
import BaseCard from 'component/core/Card'
import DisplaySlot from 'component/core/DisplaySlot'
import Link from 'component/core/Link'
import View from 'component/core/View'
import ProfileButton from 'component/profile/ProfileButton'
import WordmarkLogo from 'component/WordmarkLogo'
import { Component } from 'kitsui'
import Profile from 'model/Profile'
import Relic from 'Relic'

export default View(async view => {
	view.hasNavbar.value = false
	view.style('splash-view')

	view.style.bind(view.loading.loaded, 'splash-view--ready')

	Link('/')
		.and(WordmarkLogo)
		.viewTransition('wordmark-logo-home-link')
		.appendTo(Component()
			.style('splash-view-wordmark')
			.style.bind(view.loading.loaded, 'splash-view-wordmark--ready')
			.appendTo(view)
		)

	view.loading.appendTo(view)

	const { signal, setProgress } = await view.loading.start()
	setProgress(null, quilt => quilt['view/splash/load/connecting']())
	const conduit = await Relic.connected
	if (signal.aborted)
		return

	setProgress(null, quilt => quilt['view/splash/load/profiles']())
	await Profile.init()
	if (signal.aborted)
		return

	await view.loading.finish()

	const profiles = Profile.STATE.map(view, profiles => profiles.all)
	const hasAnyProfiles = Profile.STATE.map(view, profiles => profiles.all.length > 0)
	const authed = Profile.STATE.map(view, profiles => profiles.all.some(profile => profile.authed))

	const cards = Component().style('splash-view-cards').appendTo(view.loading)

	const Card = () => BaseCard()
		.style('splash-view-card')
		.viewTransitionSwipe('splash-view-card')
		.tweak(card => card.flush.value = true)
		.appendTo(cards)

	const profileCard = Card()
	profileCard.headerText.set(quilt => quilt['view/splash/profile-card/title']())
	profileCard.descriptionText.set(quilt => quilt['view/splash/profile-card/description']())

	DisplaySlot()
		.style('splash-view-profile-list')
		.style.bind(authed.falsy, 'splash-view-profile-list--not-authed')
		.use(profiles, (slot, profiles) => {
			for (const profile of profiles)
				ProfileButton(profile)
					.tweak(button => button.mode.setValue(profile.authed ? 'expanded' : 'collapsed'))
					.appendTo(slot)
		})
		.appendToWhen(hasAnyProfiles, profileCard)

	Button()
		.text.set(quilt => quilt['view/splash/action/authenticate']())
		.event.subscribe('click', async () => {
			await conduit.ensureAuthenticated('deepsight.gg')
			void view.refresh()
		})
		.appendToWhen(authed.falsy, profileCard)

	const collectionsCard = Card()
	collectionsCard.headerText.set(quilt => quilt['view/splash/collections-card/title']())
	collectionsCard.descriptionText.set(quilt => quilt['view/splash/collections-card/description']())

	Link('/collections')
		.and(Button)
		.text.set(quilt => quilt['view/splash/collections-card/action/view']())
		.appendTo(collectionsCard)
})

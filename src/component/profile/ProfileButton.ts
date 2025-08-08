import Button from 'component/core/Button'
import Icon from 'component/core/Icon'
import type { Profile } from 'conduit.deepsight.gg/Profile'
import { Component, State } from 'kitsui'

export type ProfileButtonDisplayMode = 'expanded' | 'collapsed' | 'simple'

interface ProfileButtonExtensions {
	readonly mode: State.Mutable<ProfileButtonDisplayMode>
}

interface ProfileButton extends Button, ProfileButtonExtensions { }

const ProfileButton = Component((component, profile: Profile): ProfileButton => {
	const displayMode = State<ProfileButtonDisplayMode>('collapsed')

	const button = component.and(Button)
		.style('profile-button')
		.style.bind(displayMode.equals('expanded'), 'profile-button--expanded')
		.style.bind(displayMode.equals('simple'), 'profile-button--simple')
		.style.bind(displayMode.mapManual(mode => mode !== 'simple' && !!profile.authed), 'profile-button--authed')
		.style.bind(displayMode.equals('expanded').mapManual(expanded => expanded && !!profile.authed), 'profile-button--authed--expanded')

	button.textWrapper.remove()

	if (profile.emblem) button
		.style.setVariable('emblem-icon', `url(https://www.bungie.net${profile.emblem.displayProperties.icon})`)
		.style.setVariable('emblem-background', `url(https://www.bungie.net${profile.emblem.secondaryIcon})`)
		.style.setVariable('emblem-background-overlay', `url(https://www.bungie.net${profile.emblem.secondaryOverlay})`)
		.style.setVariable('emblem-background-secondary', `url(https://www.bungie.net${profile.emblem.secondarySpecial})`)
		.style.setVariable('emblem-colour', `#${profile.emblem.background.toString(16).padStart(6, '0')}`)

	const isSimple = displayMode.equals('simple')
	Component()
		.style('profile-button-icon')
		.style.bind(isSimple, 'profile-button-icon--overlay')
		.style.bind(State.Every(button, isSimple, button.hoveredOrHasFocused), 'profile-button-icon--overlay--hover')
		.appendToWhen(displayMode.notEquals('expanded'), button)

	Component()
		.style('profile-button-border')
		.style.bind(displayMode.equals('simple'), 'profile-button-border--simple')
		.style.bind(button.hoveredOrHasFocused, 'profile-button-border--hover')
		.appendTo(button)

	Component()
		.style('profile-button-name')
		.append(Component().style('profile-button-name-display').text.set(profile.name))
		.append(Component().style('profile-button-name-code').text.set(`#${profile.code}`))
		.appendTo(button)

	Component()
		.style('profile-button-power')
		.style.toggle(profile.power > 200, 'profile-button-power--seasonal-bonus')
		.append(Icon.Power)
		.text.append(`${profile.power}${profile.power > 200 ? '+' : ''}`)
		.appendToWhen(displayMode.equals('expanded'), button)

	if (profile.clan?.callsign)
		Component()
			.style('profile-button-clan-callsign')
			.text.set(`[${profile.clan.callsign}]`)
			.appendToWhen(displayMode.equals('collapsed'), button)

	if (profile.guardianRank)
		Component()
			.style('profile-button-guardian-rank')
			.append(Component()
				.style('profile-button-guardian-rank-icon')
				.append(Component().style('profile-button-guardian-rank-icon-number').text.set(profile.guardianRank.rank.toString()))
			)
			.append(Component().style('profile-button-guardian-rank-name').text.set(profile.guardianRank.name))
			.appendToWhen(displayMode.equals('expanded'), button)

	if (profile.clan?.name)
		Component()
			.style('profile-button-clan-name')
			.text.set(profile.clan.name)
			.appendToWhen(displayMode.equals('expanded'), button)

	return button.extend<ProfileButtonExtensions>(button => ({
		mode: displayMode,
	}))
})

export default ProfileButton

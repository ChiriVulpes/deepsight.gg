import Button from 'component/core/Button'
import Icon from 'component/core/Icon'
import type { Profile } from 'conduit.deepsight.gg/Profile'
import { Component, State } from 'kitsui'

interface ProfileButtonExtensions {
	expanded: State.Mutable<boolean>
}

interface ProfileButton extends Button, ProfileButtonExtensions { }

const ProfileButton = Component((component, profile: Profile): ProfileButton => {
	const expanded = State(false)

	const button = component.and(Button)
		.style('profile-button')
		.style.bind(expanded, 'profile-button--expanded')

	button.textWrapper.remove()

	if (profile.emblem) button
		.style.setVariable('emblem-icon', `url(https://www.bungie.net${profile.emblem.displayProperties.icon})`)
		.style.setVariable('emblem-background', `url(https://www.bungie.net${profile.emblem.secondaryIcon})`)
		.style.setVariable('emblem-colour', `#${profile.emblem.background.toString(16).padStart(6, '0')}`)

	Component()
		.style('profile-button-icon')
		.appendToWhen(expanded.falsy, button)

	Component()
		.style('profile-button-border')
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
		.appendToWhen(expanded, button)

	if (profile.clan?.callsign)
		Component()
			.style('profile-button-clan-callsign')
			.text.set(`[${profile.clan.callsign}]`)
			.appendToWhen(expanded.falsy, button)

	if (profile.guardianRank)
		Component()
			.style('profile-button-guardian-rank')
			.append(Component()
				.style('profile-button-guardian-rank-icon')
				.append(Component().style('profile-button-guardian-rank-icon-number').text.set(profile.guardianRank.rank.toString()))
			)
			.append(Component().style('profile-button-guardian-rank-name').text.set(profile.guardianRank.name))
			.appendToWhen(expanded, button)

	if (profile.clan?.name)
		Component()
			.style('profile-button-clan-name')
			.text.set(profile.clan.name)
			.appendToWhen(expanded, button)

	return button.extend<ProfileButtonExtensions>(button => ({
		expanded,
	}))
})

export default ProfileButton

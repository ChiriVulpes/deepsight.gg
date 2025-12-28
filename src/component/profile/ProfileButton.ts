import CharacterButton from 'component/profile/CharacterButton'
import type { Profile } from 'conduit.deepsight.gg/Profile'
import { Component } from 'kitsui'

interface ProfileButton extends CharacterButton { }

const ProfileButton = Component((component, profile: Profile): ProfileButton => {
	const displayCharacter = profile.characters
		.toSorted((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
		.at(0)
	const button = component.and(CharacterButton, displayCharacter)

	button
		.style('profile-button')
		.style.bind(button.mode.equals('expanded'), 'character-button--expanded', 'profile-button--expanded')
		.style.bind(button.mode.equals('simple'), 'character-button--simple', 'profile-button--simple')
		.style.bind(button.mode.mapManual(mode => mode !== 'simple' && !!profile.authed), 'profile-button--authed')
		.style.bind(button.mode.equals('expanded').mapManual(expanded => expanded && !!profile.authed), 'profile-button--authed--expanded')

	button.nameWrapper
		.text.unbind()
		.append(Component().style('character-button-name-display').text.set(profile.name))
		.append(Component().style('character-button-name-code').text.set(`#${profile.code}`))

	button.titleWrapper.remove()

	if (profile.clan?.callsign)
		Component()
			.style('profile-button-clan-callsign')
			.text.set(`[${profile.clan.callsign}]`)
			.appendToWhen(button.mode.equals('collapsed'), button)

	if (profile.guardianRank)
		Component()
			.style('profile-button-guardian-rank')
			.append(Component()
				.style('profile-button-guardian-rank-icon')
				.append(Component().style('profile-button-guardian-rank-icon-number').text.set(profile.guardianRank.rank.toString()))
			)
			.append(Component().style('profile-button-guardian-rank-name').text.set(profile.guardianRank.name))
			.appendToWhen(button.mode.equals('expanded'), button)

	if (profile.clan?.name)
		Component()
			.style('profile-button-clan-name')
			.text.set(profile.clan.name)
			.appendToWhen(button.mode.equals('expanded'), button)

	return button
})

export default ProfileButton

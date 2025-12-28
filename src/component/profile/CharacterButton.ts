import Button from 'component/core/Button'
import Icon from 'component/core/Icon'
import type { Character } from 'conduit.deepsight.gg/Character'
import { Component, State } from 'kitsui'
import Definitions from 'model/Definitions'
import Relic from 'Relic'

export type CharacterButtonDisplayMode = 'expanded' | 'collapsed' | 'simple'

interface CharacterButtonExtensions {
	readonly mode: State.Mutable<CharacterButtonDisplayMode>
	readonly nameWrapper: Component
	readonly titleWrapper: Component
}

interface CharacterButton extends Button, CharacterButtonExtensions { }

const CharacterButton = Component((component, character?: State.Or<Character | undefined>) => {
	character = State.get(character)

	const displayMode = State<CharacterButtonDisplayMode>('collapsed')

	const button = component.and(Button)
		.style('character-button')
		.style.bind(displayMode.equals('expanded'), 'character-button--expanded')
		.style.bind(displayMode.equals('simple'), 'character-button--simple')

	button.textWrapper.remove()

	button
		.style.bindVariable('emblem-icon', character.map(button, character => character?.emblem && `url(https://www.bungie.net${character.emblem.displayProperties.icon})`))
		.style.bindVariable('emblem-background', character.map(button, character => character?.emblem && `url(https://www.bungie.net${character.emblem.secondaryIcon})`))
		.style.bindVariable('emblem-background-overlay', character.map(button, character => character?.emblem && `url(https://www.bungie.net${character.emblem.secondaryOverlay})`))
		.style.bindVariable('emblem-background-secondary', character.map(button, character => character?.emblem && `url(https://www.bungie.net${character.emblem.secondarySpecial})`))
		.style.bindVariable('emblem-colour', character.map(button, character => character?.emblem && `#${character.emblem.background.toString(16).padStart(6, '0')}`))

	const isSimple = displayMode.equals('simple')
	Component()
		.style('character-button-icon')
		.style.bind(isSimple, 'character-button-icon--overlay')
		.style.bind(State.Every(button, isSimple, button.hoveredOrHasFocused), 'character-button-icon--overlay--hover')
		.appendToWhen(displayMode.notEquals('expanded'), button)

	Component()
		.style('character-button-border')
		.style.bind(displayMode.equals('simple'), 'character-button-border--simple')
		.style.bind(button.hoveredOrHasFocused, 'character-button-border--hover')
		.appendTo(button)

	const nameWrapper = Component()
		.style('character-button-name')
		.text.bind(State.Map(button, [character, Definitions.DestinyClassDefinition], (character, DestinyClassDefinition) =>
			DestinyClassDefinition?.[character?.metadata.classHash!]?.displayProperties.name
		))
		.appendTo(button)

	const titleWrapper = Component()
		.style('character-button-title')
		.text.bind(State.Async(button, character, async character => {
			const conduit = await Relic.connected
			const titleRecord = await conduit.definitions.en.DestinyRecordDefinition.get(character?.metadata.titleRecordHash)
			return titleRecord?.titleInfo.titlesByGenderHash[character?.metadata.genderHash!]
		}))
		.appendToWhen(displayMode.equals('expanded'), button)

	Component()
		.style('character-button-power')
		.style.bind(character.map(button, character => !!character && character.metadata.light > 200), 'character-button-power--seasonal-bonus')
		.append(Icon.Power)
		.append(Component()
			.text.bind(character.map(button, character =>
				`${character?.metadata.light ?? 10}${character && character.metadata.light > 200 ? '+' : ''}`
			))
		)
		.appendToWhen(displayMode.equals('expanded'), button)

	return button.extend<CharacterButtonExtensions>(button => ({
		mode: displayMode,
		nameWrapper,
		titleWrapper,
	}))
})

export default CharacterButton

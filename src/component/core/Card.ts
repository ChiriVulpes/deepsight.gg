import Lore from 'component/core/Lore'
import Paragraph from 'component/core/Paragraph'
import { Component, State } from 'kitsui'
import type TextManipulator from 'kitsui/utility/TextManipulator'

interface CardExtensions {
	readonly header: Component
	readonly headerText: TextManipulator<this>
	readonly description: Component
	readonly descriptionText: TextManipulator<this>
	readonly flush: State.Mutable<boolean>
}

interface Card extends Component, CardExtensions { }

const Card = Component((component): Card => {
	let header: Component | undefined
	const flush = State(false)
	return component.style('card')
		.style.bind(flush, 'card--flush')
		.style.bind(State.Every(component, flush, component.hoveredOrHasFocused), 'card--flush--hover')
		.extend<CardExtensions>(card => ({
			header: undefined!,
			headerText: undefined!,
			description: undefined!,
			descriptionText: undefined!,
			flush,
		}))
		.extendJIT('header', card => header ??= Component()
			.style('card-header')
			.style.bind(flush, 'card-header--flush')
			.tweak(header => {
				const text = Component().style('card-header-text').appendTo(header)
				header.extendJIT('text', header => text.text.rehost(header))
			})
			.prependTo(card)
		)
		.extendJIT('descriptionText', card => card.description.text.rehost(card))
		.extendJIT('description', card => Paragraph().and(Lore)
			.style('card-description')
			.style.bind(flush, 'card-description--flush')
			.insertTo(card, 'after', header)
		)
		.extendJIT('headerText', card => card.header.text.rehost(card))
})

export default Card

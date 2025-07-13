import { Component } from 'kitsui'
import type TextManipulator from 'kitsui/utility/TextManipulator'

interface CardExtensions {
	readonly header: Component
	readonly headerText: TextManipulator<this>
}

interface Card extends Component, CardExtensions { }

const Card = Component((component): Card => {
	return component.style('card')
		.extend<CardExtensions>(card => ({
			header: undefined!,
			headerText: undefined!,
		}))
		.extendJIT('header', card => Component()
			.style('card-header')
			.tweak(header => {
				const text = Component().style('card-header-text').appendTo(header)
				header.extendJIT('text', header => text.text.rehost(header))
			})
			.prependTo(card)
		)
		.extendJIT('headerText', card => card.header.text.rehost(card))
})

export default Card

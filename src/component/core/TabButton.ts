import Button from 'component/core/Button'
import type { State } from 'kitsui'
import { Component } from 'kitsui'

export default Component((component, active: State<boolean>): Button => {
	return component.and(Button).style('tab-button')
		.style.bind(active, 'tab-button--active')
		.tweak(button => button
			.style.bind(button.hoveredOrHasFocused, 'button--hover', 'tab-button--hover')
		)
		.append(Component()
			.style('tab-button-underline')
			.style.bind(active, 'tab-button-underline--active')
		)
})

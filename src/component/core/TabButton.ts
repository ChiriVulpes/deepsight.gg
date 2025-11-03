import Button from 'component/core/Button'
import { Component, State } from 'kitsui'

interface TabButtonExtensions {
	setDisplayMode (mode: State.Or<'horizontal' | 'vertical'>): this
}

interface TabButton extends Button, TabButtonExtensions { }

const TabButton = Component((component, active: State<boolean>): TabButton => {
	const displayMode = State<'horizontal' | 'vertical'>('horizontal')
	return component.and(Button).style('tab-button')
		.style.bind(active, 'tab-button--active')
		.tweak(button => button
			.style.bind(button.disabled, 'button--disabled', 'tab-button--disabled')
			.style.bind(button.hoveredOrHasFocused, 'button--hover', 'tab-button--hover')
		)
		.append(Component()
			.style('tab-button-underline')
			.style.bind(displayMode.equals('vertical'), 'tab-button-underline--vertical')
			.style.bind(active, 'tab-button-underline--active')
		)
		.extend<TabButtonExtensions>(tabButton => ({
			setDisplayMode (mode) {
				if (typeof mode === 'string')
					displayMode.value = mode
				else
					displayMode.bind(tabButton, mode)
				return tabButton
			},
		}))
})

export default TabButton

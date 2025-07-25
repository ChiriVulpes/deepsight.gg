import type Collections from 'conduit.deepsight.gg/Collections'
import type { CollectionsItem } from 'conduit.deepsight.gg/Collections'
import { Component, State } from 'kitsui'
import Tooltip from 'kitsui/component/Tooltip'

export default Component((component, item: State.Or<CollectionsItem>, collections: State.Or<Collections>) => {
	item = State.get(item)
	collections = State.get(collections)

	const tooltip = component.as(Tooltip)!
		.anchor.reset()
		.anchor.add('off right', 'sticky centre')
		.anchor.add('off left', 'sticky centre')

	Component().text.bind(item.map(component, item => item.displayProperties.name)).appendTo(tooltip)

	return tooltip
})

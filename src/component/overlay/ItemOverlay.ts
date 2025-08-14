import Image from 'component/core/Image'
import Item from 'component/Item'
import type Collections from 'conduit.deepsight.gg/Collections'
import type { Item as CollectionsItem } from 'conduit.deepsight.gg/Collections'
import { Component, State } from 'kitsui'
import Slot from 'kitsui/component/Slot'
import InputBus from 'kitsui/utility/InputBus'

export default Component((component, item: State.Or<CollectionsItem | undefined>, collections: State.Or<Collections>) => {
	item = State.get(item)
	collections = State.get(collections)

	const overlay = component.style('item-overlay')

	Image(item.map(overlay, item => item?.previewImage && `https://www.bungie.net${item.previewImage}`))
		.style('item-overlay-image')
		.appendTo(overlay)

	Component()
		.style('item-overlay-header')
		.append(Slot().use(item, (_, item) => item
			&& Item(item, collections).style('item-overlay-icon')
		))
		.append(Component().style('item-overlay-title').text.bind(item.map(overlay, item => item?.displayProperties.name)))
		.append(Component().style('item-overlay-subtitle').text.bind(item.map(overlay, item => item?.type)))
		.appendTo(overlay)

	InputBus.event.until(component, event => event.subscribe('Down', (_, event) => {
		if (event.use('Escape')) {
			if (!item.value?.instanceId)
				void navigate.toURL('/collections')
			else
				throw new Error('Cannot navigate out of an item instance view yet')
		}
	}))

	return overlay
})

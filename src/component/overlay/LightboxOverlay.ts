import DisplaySlot from 'component/core/DisplaySlot'
import Image from 'component/core/Image'
import DataHelper from 'component/view/data/DataHelper'
import { Component, State } from 'kitsui'
import InputBus from 'kitsui/utility/InputBus'

export interface LightboxOverlayParams {
	url: string
	title?: string
}

export default Component((component, params: State.Mutable<LightboxOverlayParams | undefined>) => {
	component
		.style('lightbox-overlay')
		.event.subscribe('click', e => {
			if (e.targetComponent === e.host)
				params.value = undefined
		})

	DisplaySlot()
		.style('lightbox-overlay-content')
		.use(params, (slot, params) => {
			if (!params)
				return

			Component('a')
				.style('lightbox-overlay-image-anchor')
				.attributes.set('href', params.url)
				.attributes.set('target', '_blank')
				.append(Image(params.url, DataHelper.FALLBACK_ICON)
					.style('lightbox-overlay-image')
					.attributes.set('alt', params.title ?? '')
				)
				.appendTo(slot)
		})
		.appendTo(component)

	InputBus.event.until(component, event => event.subscribe('Down', (_, event) => {
		if (params.value && event.use('Escape'))
			params.value = undefined
	}))

	return component
})

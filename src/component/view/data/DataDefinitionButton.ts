import Button from 'component/core/Button'
import DisplaySlot from 'component/core/DisplaySlot'
import Image from 'component/core/Image'
import DataHelper from 'component/view/data/DataHelper'
import { Component, State } from 'kitsui'
import type { ComponentEvents } from 'kitsui/Component'
import type { StringApplicatorSource } from 'kitsui/utility/StringApplicator'
import type { RoutePath } from 'navigation/RoutePath'
import { DefinitionImageFraming, type DefinitionImage, type DefinitionImageLayout } from 'conduit.deepsight.gg/DefinitionComponents'
import type { DataTableName } from './DataTable'

type ImageSlots = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
type ImageSlotsClass = `data-view-definition-button-images--slots-${ImageSlots}`

function imageSlotsClass (slots: number | undefined): ImageSlotsClass {
	return `data-view-definition-button-images--slots-${(slots ?? 8) as ImageSlots}`
}

function getImageSlots (data: DataDefinitionButtonData | undefined): ImageSlots {
	const slots = data?.images?.length || data?.imageLayout?.slots || 8
	return Math.max(1, Math.min(8, slots)) as ImageSlots
}

export interface DataDefinitionButtonData {
	component: DataTableName
	definition: object
	singleDefComponent?: true
	customSubtitle?: StringApplicatorSource
	images?: readonly DefinitionImage[]
	imageLayout?: DefinitionImageLayout
}

interface DataDefinitionButtonEvents extends ComponentEvents {
	BackgroundOpen (path: RoutePath, data: DataDefinitionButtonData): unknown
	ImageOpen (image: DefinitionImage, data: DataDefinitionButtonData): unknown
}

interface DataDefinitionButtonExtensions {
	readonly data: State.Mutable<DataDefinitionButtonData | undefined>
}

interface DataDefinitionButton extends Component.WithEvents<DataDefinitionButtonEvents>, DataDefinitionButtonExtensions { }

const DataDefinitionButton = Component<[], DataDefinitionButton>('a', component => component
	.and(Button)
	.style('data-view-definition-button')
	.extend<DataDefinitionButtonExtensions>(component => ({
		data: State(undefined),
	}))
	.event.subscribe(['click', 'contextmenu'], e => {
		e.preventDefault()
		const url = e.host.attributes.get('href')?.value
		if (url)
			void navigate.toURL(url as RoutePath)
		return false
	})
	.event.subscribe('auxclick', e => {
		if (e.button !== 1 || e.ctrlKey || e.metaKey)
			return

		const url = e.host.attributes.get('href')?.value
		const data = e.host.data.value
		if (!url || !data)
			return

		const result = (e.host as DataDefinitionButton).event.emit('BackgroundOpen', url as RoutePath, data)
		if (result.defaultPrevented) {
			e.preventDefault()
			return false
		}
	})
	.tweak(button => {
		const imageHovered = State(false)
		let hoveredImageTargets = 0

		button.style.bind(imageHovered, 'data-view-definition-button--image-hover')
		button.style.bind(button.data.map(button, data => !!data?.images), 'data-view-definition-button--images')
		button.textWrapper.remove()

		button.attributes.bind('href', button.data.mapManual(data => !data ? undefined
			: !('hash' in data.definition)
				? `/data/${data.component}/full`
				: `/data/${data.component}/${String(data.definition.hash)}`
		))

		const icon = button.data.mapManual(data => DataHelper.getIcon(data?.component, data?.definition))
		const title = button.data.mapManual(data => {
			if (data?.singleDefComponent)
				return DataHelper.getComponentName(data?.component, true)
			else
				return DataHelper.getTitle(data?.component, data?.definition)
		})
		const subtitle = button.data.mapManual(data => {
			if (data?.customSubtitle)
				return data.customSubtitle

			if (data?.singleDefComponent)
				return DataHelper.getComponentProvider(data?.component)
			else
				return DataHelper.getSubtitle(data?.component, data?.definition)
		})

		Image(icon, DataHelper.FALLBACK_ICON)
			.style('data-view-definition-button-icon')
			.appendTo(button)

		Component()
			.style('data-view-definition-button-title')
			.and(DisplaySlot)
			.use(title, (slot, title) => DataHelper.renderContent(slot, title))
			.appendTo(button)

		Component()
			.style('data-view-definition-button-subtitle')
			.and(DisplaySlot)
			.use(subtitle, (slot, subtitle) => DataHelper.renderContent(slot, subtitle))
			.appendTo(button)

		Component()
			.style('data-view-definition-button-images')
			.style.bindFrom(button.data.map(button, data => imageSlotsClass(getImageSlots(data))))
			.and(DisplaySlot)
			.use(button.data, (slot, data) => {
				const images = data?.images ?? []
				for (const image of images.slice(0, getImageSlots(data))) {
					const imageElement = Image(image.url, DataHelper.FALLBACK_ICON)
						.style('data-view-definition-button-image')
						.style.bindVariable('data-view-definition-button-image-fit', image.framing === DefinitionImageFraming.Complete ? 'contain' : 'cover')
						.tweak(image => {
							image.style.bindVariable('data-view-definition-button-image-natural-width', image.dimensions.map(image, dimensions => dimensions && `${dimensions.width}px`))
							image.style.bindVariable('data-view-definition-button-image-natural-height', image.dimensions.map(image, dimensions => dimensions && `${dimensions.height}px`))
						})
					const target = Component('span')
						.style('data-view-definition-button-image-target')
						.event.subscribe('click', e => {
							if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)
								return

							const data = button.data.value
							if (!data)
								return

							const result = (button as DataDefinitionButton).event.emit('ImageOpen', image, data)
							if (result.defaultPrevented) {
								e.preventDefault()
								return false
							}
						})
						.event.subscribe('contextmenu', e => {
							const data = button.data.value
							if (!data)
								return

							const result = (button as DataDefinitionButton).event.emit('ImageOpen', image, data)
							if (result.defaultPrevented) {
								e.preventDefault()
								e.stopPropagation()
								return false
							}
						})
						.append(imageElement)
						.appendTo(slot)

					let targetHovered = false
					target.hoveredOrHasFocused.use(target, hovered => {
						if (hovered === targetHovered)
							return

						targetHovered = hovered
						hoveredImageTargets += hovered ? 1 : -1
						imageHovered.value = hoveredImageTargets > 0
					})
					target.onRemoveManual(() => {
						if (!targetHovered)
							return

						hoveredImageTargets--
						imageHovered.value = hoveredImageTargets > 0
					})
				}
			})
			.appendToWhen(button.data.map(button, data => !!data?.images?.length), button)
	})
)

export default DataDefinitionButton

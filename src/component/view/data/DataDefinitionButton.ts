import Button from 'component/core/Button'
import DisplaySlot from 'component/core/DisplaySlot'
import Image from 'component/core/Image'
import DataHelper from 'component/view/data/DataHelper'
import { Component, State } from 'kitsui'
import type { StringApplicatorSource } from 'kitsui/utility/StringApplicator'
import type { RoutePath } from 'navigation/RoutePath'
import type { DataTableName } from './DataTable'

interface DataDefinitionButtonData {
	component: DataTableName
	definition: object
	singleDefComponent?: true
	customSubtitle?: StringApplicatorSource
}

interface DataDefinitionButtonExtensions {
	readonly data: State.Mutable<DataDefinitionButtonData | undefined>
}

interface DataDefinitionButton extends Component, DataDefinitionButtonExtensions { }

const DataDefinitionButton = Component('a', (component): DataDefinitionButton => component
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
	.tweak(button => {
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
	})
)

export default DataDefinitionButton

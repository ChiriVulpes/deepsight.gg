import Button from 'component/core/Button'
import Image from 'component/core/Image'
import DataHelper from 'component/view/data/DataHelper'
import type { AllComponentNames } from 'conduit.deepsight.gg/DefinitionComponents'
import { Component, State } from 'kitsui'
import type { RoutePath } from 'navigation/RoutePath'

interface DataDefinitionButtonData {
	component: AllComponentNames
	definition: object
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
	.event.subscribe('click', e => e.preventDefault())
	.event.subscribe('contextmenu', e => {
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
		const title = button.data.mapManual(data => DataHelper.getTitle(data?.component, data?.definition))
		const subtitle = button.data.mapManual(data => DataHelper.getSubtitle(data?.component, data?.definition))

		Image(icon, DataHelper.FALLBACK_ICON)
			.style('data-view-definition-button-icon')
			.appendTo(button)

		Component()
			.style('data-view-definition-button-title')
			.text.bind(title)
			.appendTo(button)

		Component()
			.style('data-view-definition-button-subtitle')
			.text.bind(subtitle)
			.appendTo(button)
	})
)

export default DataDefinitionButton

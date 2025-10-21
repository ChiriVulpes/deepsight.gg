import type { DestinyDisplayPropertiesDefinition } from 'bungie-api-ts/destiny2'
import Button from 'component/core/Button'
import Image from 'component/core/Image'
import DataComponentHelper from 'component/view/data/DataComponentHelper'
import DataHelperRegistry from 'component/view/data/DataHelperRegistry'
import type { AllComponentNames } from 'conduit.deepsight.gg/DefinitionComponents'
import type { DeepsightDisplayPropertiesDefinition } from 'deepsight.gg/Interfaces'
import { Component, State } from 'kitsui'
import { _ } from 'utility/Objects'

interface DataDefinitionButtonData {
	component: AllComponentNames
	definition: object
}

interface DataDefinitionButtonExtensions {
	readonly data: State.Mutable<DataDefinitionButtonData | null>
}

interface DataDefinitionButton extends Component, DataDefinitionButtonExtensions { }

const DataDefinitionButton = Component((component): DataDefinitionButton => component
	.and(Button)
	.style('data-view-definition-button')
	.extend<DataDefinitionButtonExtensions>(component => ({
		data: State(null),
	}))
	.tweak(button => {
		button.textWrapper.remove()

		function display (data: DataDefinitionButtonData | null) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			return (data?.definition as any)?.['displayProperties'] as Partial<DestinyDisplayPropertiesDefinition> & Partial<DeepsightDisplayPropertiesDefinition> | undefined
		}

		function helper (data: DataDefinitionButtonData | null) {
			return data?.component ? DataHelperRegistry[data.component] : undefined
		}

		const icon = button.data.mapManual(data => {
			if (data) {
				const icon = _
					?? DataHelperRegistry[data.component]?.getIcon?.(data.definition)
					?? display(data)?.icon

				if (icon && icon.startsWith('/'))
					return `https://www.bungie.net${icon}`
				if (icon && icon.startsWith('./'))
					return `https://deepsight.gg${icon.slice(1)}`
			}

			return 'https://www.bungie.net/img/destiny_content/collections/undiscovered.png'
		})

		const title = button.data.mapManual(data => _
			|| helper(data)?.getName?.(data?.definition)
			|| display(data)?.name
			|| 'No name'
		)

		const subtitle = button.data.mapManual(data => !data ? undefined : _
			|| helper(data)?.getSubtitle?.(data.definition)
			|| display(data)?.subtitle
			|| DataComponentHelper.getComponentName(data.component)
		)

		Image(icon)
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

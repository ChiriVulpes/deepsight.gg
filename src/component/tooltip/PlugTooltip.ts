import DisplaySlot from 'component/core/DisplaySlot'
import Icon from 'component/core/Icon'
import Image from 'component/core/Image'
import Stats from 'component/item/Stats'
import type Collections from 'conduit.deepsight.gg/Collections'
import type { ItemPlug } from 'conduit.deepsight.gg/Collections'
import type { ClarityComponentAll } from 'deepsight.gg/Interfaces'
import { Component, State } from 'kitsui'
import Tooltip from 'kitsui/component/Tooltip'
import type { Styles } from 'kitsui/utility/StyleManipulator'
import { Icons, type IconsKey } from 'style/icons'

const CLARITY_CLASS_ICON_MAP: Record<string, IconsKey> = {
	heavy: 'AmmoHeavy',
	primary: 'AmmoPrimary',
	special: 'AmmoSpecial',
	arc: 'DamageArc',
	kinetic: 'DamageKinetic',
	prismatic: 'DamagePrismatic',
	solar: 'DamageSolar',
	stasis: 'DamageStasis',
	strand: 'DamageStrand',
	void: 'DamageVoid',
	power: 'Power',
}

let instance: Tooltip | undefined
let instancePlugState: State.Mutable<ItemPlug> | undefined
let instanceCollectionsState: State.Mutable<Collections> | undefined
const PlugTooltip = Object.assign(
	Component((component, plug: State.Or<ItemPlug>, collections: State.Or<Collections>) => {
		plug = State.get(plug)
		collections = State.get(collections)

		const tooltip = component.as(Tooltip)!
			.anchor.reset()
			.anchor.add('off right', 'sticky centre')
			.anchor.add('off left', 'sticky centre')

		plug.use(component, plug => console.log(plug.displayProperties.name, plug))

		////////////////////////////////////
		//#region Header

		tooltip.header.style('item-tooltip-header', 'plug-tooltip-header')

		Component()
			.style('item-tooltip-title')
			.text.bind(plug.map(tooltip, plug => plug.displayProperties.name))
			.appendTo(tooltip.header)

		Component()
			.style('item-tooltip-subtitle')
			.append(Component()
				.style('item-tooltip-subtitle-type')
				.text.bind(plug.map(tooltip, plug => plug.type))
			)
			// .append(Component()
			// 	.style('item-tooltip-subtitle-rarity')
			// 	.text.bind(rarity.map(tooltip, rarity => rarity.displayProperties.name))
			// )
			.appendTo(tooltip.header)

		//#endregion
		////////////////////////////////////

		tooltip.body.style('item-tooltip-body')

		Component()
			.style('plug-tooltip-description')
			.text.bind(plug.map(tooltip, plug => plug.displayProperties.description))
			.appendTo(tooltip.body)

		Component()
			.style('item-tooltip-stats', 'plug-tooltip-stats')
			.and(Stats, plug, collections)
			.tweak(stats => {
				stats.style.bind(stats.anyVisible.falsy, 'item-tooltip-stats--no-visible-stats')
				stats.appendToWhen(stats.hasStats, tooltip.body)
			})

		const clarity = plug.map(component, plug => plug.clarity)
		DisplaySlot().style('plug-tooltip-clarity').appendToWhen(clarity.truthy, tooltip.body).use(clarity, (slot, clarity) => {
			if (!clarity?.descriptions.length)
				return

			Component()
				.style('plug-tooltip-clarity-header')
				.append(Image('https://avatars.githubusercontent.com/u/117947315?s=48&v=4').style('plug-tooltip-clarity-header-icon'))
				.append(Component().style('plug-tooltip-clarity-header-name').text.set('Clarity'))
				.text.append(' / Community Insights')
				.appendTo(slot)

			const clarityComponents: { [KEY in ClarityComponentAll['type']]: (component: Component, data: ClarityComponentAll & { type: KEY }) => Component | undefined } = {
				icon: (component, data) => {
					// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
					const iconKey = CLARITY_CLASS_ICON_MAP[data.classNames?.[0]!]
					return !iconKey ? undefined : (component
						.style('plug-tooltip-clarity-icon')
						.append(Icon[iconKey].style(`plug-tooltip-clarity-icon--${Icons[iconKey]}` as keyof Styles))
					)
				},
				table: (component, data) => (component
					.style('plug-tooltip-clarity-table')
					.append(...data.rows.map(ClarityComponent))
				),
				tableRow: (component, data) => (component
					.style('plug-tooltip-clarity-table-row')
					.append(...data.cells.map(ClarityComponent))
				),
				tableCell: (component, data) => (component
					.style('plug-tooltip-clarity-table-cell')
					.style.toggle(!!data.isNumeric, 'plug-tooltip-clarity-table-cell--numeric')
				),
				text: (component, data) => (component
					.style('plug-tooltip-clarity-text')
				),
				numeric: (component, data) => (component
					.style('plug-tooltip-clarity-numeric')
					.style.toggle(!!data.isEstimate, 'plug-tooltip-clarity-numeric--estimate')
					.style.toggle(!!data.isUnknown, 'plug-tooltip-clarity-numeric--unknown')
				),
				stackSeparator: (component, data) => (component
					.style('plug-tooltip-clarity-stack-separator')
					.text.set('/')
				),
				line: (component, data) => (component
					.style('plug-tooltip-clarity-line')
					.style.toggle(!!data.isEnhanced, 'plug-tooltip-clarity-line--enhanced')
					.style.toggle(!!data.isLabel, 'plug-tooltip-clarity-line--label')
					.style.toggle(!!data.isListItem, 'plug-tooltip-clarity-line--list-item')
				),
				labelledLine: (component, data) => (component
					.style('plug-tooltip-clarity-labelled-line')
					.append(Component().style('plug-tooltip-clarity-labelled-line-label').append(...data.label.map(ClarityComponent)))
					.append(Component().style('plug-tooltip-clarity-labelled-line-value').append(...data.value.map(ClarityComponent)))
				),
				pve: (component, data) => (component
					.style('plug-tooltip-clarity-pvevp', 'plug-tooltip-clarity-pve')
					.prepend(Component().style('plug-tooltip-clarity-pvevp-label').text.set(quilt => quilt['plug-tooltip/clarity/label-pve']()))
				),
				pvp: (component, data) => (component
					.style('plug-tooltip-clarity-pvevp', 'plug-tooltip-clarity-pvp')
					.prepend(Component().style('plug-tooltip-clarity-pvevp-label').text.set(quilt => quilt['plug-tooltip/clarity/label-pvp']()))
				),
				spacer: (component, data) => (component
					.style('plug-tooltip-clarity-spacer')
				),
				enhancedArrow: (component, data) => (component
					.style('plug-tooltip-clarity-enhanced-arrow')
				),
				definitionReference: (component, data) => (component
					.style('plug-tooltip-clarity-definition-reference')
				),
			}

			slot.append(...clarity.descriptions.map(ClarityComponent))

			function applyClassNames (into: Component, classNames?: string[]) {
				into.attributes.set('data-clarity-class', classNames?.join(' '))
			}

			function ClarityComponent (clarityComponent: ClarityComponentAll): Component {
				return Component()
					.tweak(applyClassNames, clarityComponent.classNames)
					.text.set('text' in clarityComponent ? clarityComponent.text : '')
					.append(...'content' in clarityComponent ? clarityComponent.content.map(ClarityComponent) : [])
					.tweak(clarityComponents[clarityComponent.type] as never, clarityComponent)
			}
		})

		return tooltip
	}),
	{
		apply (component: Component, plug: State.Or<ItemPlug>, collections: State.Or<Collections>) {
			plug = State.get(plug)
			collections = State.get(collections)
			const componentWithPopover = instance
				? component.setTooltip(instance)
				: component.setTooltip(tooltip => instance ??= tooltip.and(PlugTooltip, instancePlugState ??= State.Mutable(tooltip, plug), instanceCollectionsState ??= State.Mutable(tooltip, collections)))

			State.Use(component, { focused: componentWithPopover.hoveredOrHasFocused, visible: componentWithPopover.popover.visible }).subscribe(component, ({ focused, visible }, { visible: oldVisible } = { focused: false, visible: false }) => {
				if (focused && visible && !oldVisible) {
					console.log(plug.value.displayProperties.name, plug.value)
					PlugTooltip.update(plug, collections)
				}
			})
		},
		update (plug: State.Or<ItemPlug>, collections: State.Or<Collections>): void {
			if (!instancePlugState || !instanceCollectionsState)
				return

			if (State.is(plug))
				instancePlugState.bind(instance!, plug)
			else
				instancePlugState.value = plug

			if (State.is(collections))
				instanceCollectionsState.bind(instance!, collections)
			else
				instanceCollectionsState.value = collections
		},
	},
)

export default PlugTooltip

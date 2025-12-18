import DisplaySlot from 'component/core/DisplaySlot'
import Icon from 'component/core/Icon'
import Image from 'component/core/Image'
import Stats from 'component/item/Stats'
import type Collections from 'conduit.deepsight.gg/item/Collections'
import type { ItemPlug } from 'conduit.deepsight.gg/item/Item'
import type { ClarityComponentAll, ClarityLabelledLineComponent } from 'deepsight.gg/Interfaces'
import { Component, State } from 'kitsui'
import Tooltip from 'kitsui/component/Tooltip'
import type { Styles } from 'kitsui/utility/StyleManipulator'
import { Icons, type IconsKey } from 'style/icons'
import TooltipManager from 'utility/TooltipManager'

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

const PlugTooltip = Component((component, plug: State<ItemPlug>, collections: State<Collections>) => {
	const tooltip = component.as(Tooltip)!
		.anchor.reset()
		.anchor.add('off right', 'sticky centre')
		.anchor.add('off left', 'sticky centre')

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
		.append(Component()
			.style('plug-tooltip-description-content')
			.text.bind(plug.map(tooltip, plug => plug.displayProperties.description))
		)
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

		const clarityComponents: { [KEY in ClarityComponentAll['type']]: (component: Component, data: ClarityComponentAll & { type: KEY }, context: ClarityContext) => Component | undefined } = {
			icon: (component, data) => {
				const iconKey = CLARITY_CLASS_ICON_MAP[data.classNames?.[0]!]
				return !iconKey ? undefined : (component
					.style('plug-tooltip-clarity-icon')
					.append(Icon[iconKey].style(`plug-tooltip-clarity-icon--${Icons[iconKey]}` as keyof Styles))
				)
			},
			table: (component, data) => (component
				.style('plug-tooltip-clarity-table')
				.append(...ClarityChildren(data.rows, data))
			),
			tableRow: (component, data) => (component
				.style('plug-tooltip-clarity-table-row')
				.append(...ClarityChildren(data.cells, data))
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
			line: (component, data, { siblings }, previousData = previousSibling(siblings, data)) => (component
				.style('plug-tooltip-clarity-line')
				.style.toggle(!!data.isEnhanced, 'plug-tooltip-clarity-line--enhanced')
				.style.toggle(!!data.isLabel, 'plug-tooltip-clarity-line--label')
				.style.toggle(!!data.isListItem, 'plug-tooltip-clarity-line--list-item')
				.style.toggle(!!data.isListItem && previousData?.type === 'line' && !!previousData.isLabel, 'plug-tooltip-clarity-line--list-item--after-label')
			),
			labelledLine: (component, data, { siblings }, previousData = previousSibling(siblings, data)) => (component
				.style('plug-tooltip-clarity-labelled-line')
				.style.toggle(!!data.isListItem, 'plug-tooltip-clarity-line--list-item', 'plug-tooltip-clarity-labelled-line--list-item')
				.style.toggle(!!data.isListItem && previousData?.type === 'line' && !!previousData.isLabel, 'plug-tooltip-clarity-line--list-item--after-label')
				.style.toggle(Math.max(...adjacentLabelledLines(siblings, data).map(l => getLength(l))) < 48, 'plug-tooltip-clarity-labelled-line--simple')
				.append(Component().style('plug-tooltip-clarity-labelled-line-label').append(...ClarityChildren(data.label, data)))
				.append(Component().style('plug-tooltip-clarity-labelled-line-value').append(...ClarityChildren(data.value, data)))
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

		const context: ClarityContext = { type: 'context', siblings: clarity.descriptions }
		slot.append(...clarity.descriptions.map(desc => ClarityComponent(desc, context)))

		function applyClassNames (into: Component, classNames?: string[]) {
			into.attributes.set('data-clarity-class', classNames?.join(' '))
		}

		interface ClarityContext {
			type: 'context'
			parent?: ClarityComponentAll
			siblings: ClarityComponentAll[]
		}

		function ClarityChildren (children: ClarityComponentAll[], context?: ClarityContext | ClarityComponentAll): Component[] {
			context = context?.type === 'context' ? context : context && { type: 'context', parent: context, siblings: children }
			return children.map(child => ClarityComponent(child, context))
		}

		function ClarityComponent (clarityComponent: ClarityComponentAll, context?: ClarityContext): Component {
			return Component()
				.tweak(applyClassNames, clarityComponent.classNames)
				.text.set('text' in clarityComponent ? clarityComponent.text : '')
				.append(...'content' in clarityComponent ? ClarityChildren(clarityComponent.content, context) : [])
				.tweak(clarityComponents[clarityComponent.type] as never, clarityComponent, context ?? { type: 'context', siblings: [] })
		}

		function previousSibling (siblings: ClarityComponentAll[], component: ClarityComponentAll): ClarityComponentAll | undefined {
			return siblings[siblings.indexOf(component) - 1]
		}

		function adjacentLabelledLines (siblings: ClarityComponentAll[], line: ClarityLabelledLineComponent) {
			const indexOfLine = siblings.indexOf(line)
			if (indexOfLine === -1)
				return []

			const result: ClarityLabelledLineComponent[] = []
			for (let i = indexOfLine - 1; i >= 0 && siblings[i].type === 'labelledLine'; i--)
				result.unshift(siblings[i] as ClarityLabelledLineComponent)

			for (let i = indexOfLine + 1; i < siblings.length && siblings[i].type === 'labelledLine'; i++)
				result.push(siblings[i] as ClarityLabelledLineComponent)

			return result
		}

		function getLength (...components: ClarityComponentAll[]): number {
			if (components.length !== 1)
				return components.map(c => getLength(c)).reduce((a, b) => a + b, 0)

			const component = components[0]
			switch (component.type) {
				case 'text':
					return component.text.length
				case 'numeric':
					return Math.ceil(component.text.length * 1.2)
				case 'icon':
				case 'enhancedArrow':
					return 4
				case 'stackSeparator':
					return 10
				case 'definitionReference':
					// TODO
					return 0
				case 'spacer':
				case 'table':
				case 'tableRow':
					return 80
				case 'labelledLine':
					return getLength(...component.label) + getLength(...component.value)
				case 'line':
				case 'tableCell':
					return getLength(...component.content)
				case 'pve':
				case 'pvp':
					return getLength(...component.content) + 4 // 4 for the label
			}
		}
	})

	return tooltip
})

export default TooltipManager(PlugTooltip, {
	states: {
		plug: undefined as State.Mutable<ItemPlug> | undefined,
		collections: undefined as State.Mutable<Collections> | undefined,
	},
	update (states, plug: State.Or<ItemPlug>, collections: State.Or<Collections>) {
		states.updatePlug(plug)
		states.updateCollections(collections)
	},
	build (states, tooltip, plug: State.Or<ItemPlug>, collections: State.Or<Collections>) {
		plug = State.get(plug)
		collections = State.get(collections)
		return tooltip.and(PlugTooltip,
			states.plug ??= State.Mutable(tooltip, plug),
			states.collections ??= State.Mutable(tooltip, collections),
		)
	},
	onHover (states, plug: State.Or<ItemPlug>, collections: State.Or<Collections>) {
		plug = State.value(plug)
		console.log(plug.displayProperties.name, plug)
	},
})

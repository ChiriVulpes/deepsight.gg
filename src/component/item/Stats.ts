import type { DestinyStatDefinition, DestinyStatGroupDefinition } from 'bungie-api-ts/destiny2'
import type Collections from 'conduit.deepsight.gg/Collections'
import type { Item, ItemPlug, ItemStat } from 'conduit.deepsight.gg/Collections'
import { StatHashes } from 'deepsight.gg/Enums'
import { Component, State } from 'kitsui'

const STATS_FILTERED_OUT = new Set<StatHashes>([
	StatHashes.Impact,
	StatHashes.AimAssistance,
	StatHashes.Zoom,
	StatHashes.AirborneEffectiveness,
	StatHashes.AmmoGeneration,
	StatHashes.RecoilDirection,
])

interface StatsExtensions {
	readonly anyVisible: State<boolean>
	readonly hasStats: State<boolean>
}

interface Stats extends Component, StatsExtensions { }

export interface StatsDisplayDefinition {
	isAbbreviated?: true
	tweakStatSection?(section: Component): unknown
	tweakStatWrapper?(wrapper: Component): unknown
	tweakStatLabel?(label: Component, definition: DestinyStatDefinition, stat: ItemStat): unknown
	tweakStatBar?(bar: Component, definition: DestinyStatDefinition, stat: ItemStat): unknown
	tweakStatValue?(value: Component, definition: DestinyStatDefinition, stat: ItemStat): unknown
}

const Stats = Component((component, item: State.Or<Item | ItemPlug | undefined>, collections: State.Or<Collections>, display?: StatsDisplayDefinition): Stats => {
	item = State.get(item)
	collections = State.get(collections)

	component.style('stats')

	const statsVisible = State(false)
	const hasStats = State(false)
	const isAbbreviated = State(false)

	State.Use(component, { item, collections, isAbbreviated }, ({ item, collections, isAbbreviated }) => {
		component.removeContents()

		let _barStatsWrapper: Component | undefined
		let _numericStatsWrapper: Component | undefined
		const barStatsWrapper = () => _barStatsWrapper ??= Component().style('stats-section').tweak(display?.tweakStatSection).prependTo(component)
		const numericStatsWrapper = () => _numericStatsWrapper ??= Component().style('stats-section').tweak(display?.tweakStatSection).appendTo(component)

		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		const statGroupDef = collections.statGroups[(item as Item)?.statGroupHash!] as DestinyStatGroupDefinition | undefined
		const stats = !item?.stats ? [] : Object.values(item.stats)
			.sort((a, b) => 0
				|| +(a.displayAsNumeric ?? false) - +(b.displayAsNumeric ?? false)
				|| (statGroupDef && ((statGroupDef.scaledStats.findIndex(stat => stat.statHash as StatHashes === a.hash) ?? 0) - (statGroupDef.scaledStats.findIndex(stat => stat.statHash as StatHashes === b.hash) ?? 0)))
				|| (collections.stats[a.hash]?.index ?? 0) - (collections.stats[b.hash]?.index ?? 0)
			)

		hasStats.value = statGroupDef ? !!statGroupDef.scaledStats.length : !!stats.length

		let hasVisibleStat = false
		for (const stat of stats) {
			const def = collections.stats[stat.hash]
			const overrideDisplayProperties = statGroupDef?.overrides?.[stat.hash]?.displayProperties
			const statName = (overrideDisplayProperties ?? def?.displayProperties)?.name ?? ''
			if (!statName || (item!.is === 'item' && isAbbreviated && STATS_FILTERED_OUT.has(stat.hash)))
				continue

			hasVisibleStat = true

			Component()
				.style('stats-stat')
				.append(Component()
					.style('stats-stat-label')
					.text.set(statName)
					.tweak(display?.tweakStatLabel, def, stat)
				)
				.append(!stat.displayAsNumeric && Component()
					.style('stats-stat-bar')
					.style.toggle(stat.value < 0, 'stats-stat-bar--negative')
					.style.setVariable('stats-stat-bar-progress', stat.value / (stat.max ?? 100))
					.tweak(display?.tweakStatBar, def, stat)
				)
				.append(Component()
					.style('stats-stat-value')
					.text.set((item!.is === 'plug' && stat.value >= 0 ? '+' : '') + stat.value.toLocaleString(navigator.language))
					.tweak(display?.tweakStatValue, def, stat)
				)
				.tweak(display?.tweakStatWrapper)
				.appendTo(stat.displayAsNumeric ? numericStatsWrapper() : barStatsWrapper())
		}

		statsVisible.value = hasVisibleStat
	})

	return component.extend<StatsExtensions>(stats => ({
		anyVisible: statsVisible,
		hasStats,
		isAbbreviated,
	}))
})

export default Stats

import type { SortDefinition, SortDefinitionId, SortEntry } from 'component/display/sort/SortDefinition'
import { SortDefinitionCompare } from 'component/display/sort/SortDefinition'
import { State } from 'kitsui'
import type { StringApplicatorSource } from 'kitsui/utility/StringApplicator'
import { StringApplicatorSource as StringApplicatorSourceValue } from 'kitsui/utility/StringApplicator'
import type { ItemStateOptional } from 'model/Items'
import Store from 'utility/Store'

export interface SortConfig {
	readonly id: string
	readonly definitions?: readonly SortDefinition[]
	readonly default?: readonly SortEntry[]
	readonly inapplicable?: readonly SortDefinitionId[]
}

export interface SortRow {
	readonly type: 'sort'
	readonly id: SortDefinitionId
	readonly key: string
	readonly definition: SortDefinition
	readonly reverse: boolean
	readonly active: boolean
}

export interface SortDividerRow {
	readonly type: 'divider'
	readonly id: 'inactive'
	readonly key: 'sort-divider:inactive'
	readonly label: StringApplicatorSource
}

export type SortDisplayRow = SortRow | SortDividerRow

class SortManager {

	readonly entries = State<readonly SortEntry[]>([])
	readonly activeRows = State<readonly SortRow[]>([])
	readonly inactiveRows = State<readonly SortRow[]>([])
	readonly displayRows = State<readonly SortDisplayRow[]>([])
	readonly stateHash = State('')
	readonly sortText = State<string | undefined>(undefined)

	private config?: SortConfig
	private definitions: readonly SortDefinition[] = []
	private definitionsById = new Map<SortDefinitionId, SortDefinition>()
	private reversedById = new Map<SortDefinitionId, boolean>()
	private rowOrder: SortDefinitionId[] = []
	private configId?: string

	configure (config?: SortConfig) {
		if (this.configId !== config?.id) {
			this.rowOrder = []
			this.configId = config?.id
		}
		this.config = config
		this.definitions = (config?.definitions ?? [])
			.filter(definition => !config?.inapplicable?.includes(definition.id))
		this.definitionsById = new Map(this.definitions.map(definition => [definition.id, definition]))
		this.entries.value = config ? this.loadEntries(config) : []
		this.reconcileRowOrder(this.entries.value.map(entry => entry.id))
		this.refresh()
		return this
	}

	applyRows (rows: readonly SortDisplayRow[]) {
		const entries: SortEntry[] = []
		this.rowOrder = this.reconcileRowOrder(rows
			.filter((row): row is SortRow => row.type === 'sort')
			.map(row => row.id)
		)
		let active = true
		for (const row of rows) {
			if (row.type === 'divider') {
				active = false
				continue
			}

			if (!active)
				continue

			entries.push({
				id: row.id,
				reverse: row.reverse || undefined,
			})
		}

		this.setEntries(entries)
	}

	activate (id: SortDefinitionId) {
		if (this.entries.value.some(entry => entry.id === id))
			return

		this.setEntries([...this.entries.value, {
			id,
			reverse: this.reversedById.get(id) || undefined,
		}])
	}

	deactivate (id: SortDefinitionId) {
		this.setEntries(this.entries.value.filter(entry => entry.id !== id))
	}

	toggleReverse (id: SortDefinitionId) {
		this.setEntries(this.entries.value.map(entry => entry.id === id ? {
			...entry,
			reverse: !entry.reverse || undefined,
		} : entry))
	}

	compare (a: ItemStateOptional, b: ItemStateOptional) {
		if (!this.entries.value.length)
			return 0

		for (const entry of this.entries.value) {
			const definition = this.definitionsById.get(entry.id)
			if (!definition)
				continue

			const result = definition.compare(a, b)
			if (result)
				return entry.reverse ? -result : result
		}

		return fallbackCompare(a, b)
	}

	private setEntries (entries: readonly SortEntry[]) {
		for (const entry of this.entries.value)
			this.reversedById.set(entry.id, !!entry.reverse)

		this.entries.value = entries
			.filter(entry => this.definitionsById.has(entry.id))
			.map(entry => {
				this.reversedById.set(entry.id, !!entry.reverse)
				return entry
			})
		if (this.config)
			Store.set(this.storeKey(this.config), this.entries.value)

		this.reconcileRowOrder(this.entries.value.map(entry => entry.id))
		this.refresh()
	}

	private loadEntries (config: SortConfig) {
		const storedEntries = Store.get<SortEntry[]>(this.storeKey(config))
		const entries = storedEntries ?? config.default ?? []
		const validEntries = entries.filter(entry => this.definitionsById.has(entry.id))
		for (const entry of validEntries)
			this.reversedById.set(entry.id, !!entry.reverse)
		return validEntries
	}

	private refresh () {
		this.reconcileRowOrder(this.entries.value.map(entry => entry.id))
		const activeRows: SortRow[] = []
		for (const entry of this.entries.value) {
			const definition = this.definitionsById.get(entry.id)
			if (definition)
				activeRows.push({
					type: 'sort',
					id: entry.id,
					key: `sort:${entry.id}`,
					definition,
					reverse: !!entry.reverse,
					active: true,
				})
		}
		const activeIds = new Set(activeRows.map(row => row.id))
		const inactiveRows = this.rowOrder
			.map(id => this.definitionsById.get(id))
			.filter(definition => definition && !activeIds.has(definition.id))
			.map((definition): SortRow => ({
				type: 'sort',
				id: definition!.id,
				key: `sort:${definition!.id}`,
				definition: definition!,
				reverse: this.reversedById.get(definition!.id) ?? false,
				active: false,
			}))

		const divider: SortDividerRow = {
			type: 'divider',
			id: 'inactive',
			key: 'sort-divider:inactive',
			label: quilt => quilt['display-bar/sort/inactive/title'](),
		}

		this.activeRows.value = activeRows
		this.inactiveRows.value = inactiveRows
		this.displayRows.value = [...activeRows, divider, ...inactiveRows]
		this.stateHash.value = this.entries.value.map(entry => `${entry.id}:${!!entry.reverse}`).join(',')
		this.sortText.value = !activeRows.length
			? undefined
			: activeRows.map(row => StringApplicatorSourceValue.toString(row.definition.shortLabel ?? row.definition.label)).join(', ')
	}

	private storeKey (config: SortConfig) {
		return `display-sort:${config.id}`
	}

	private reconcileRowOrder (preferredPrefix: readonly SortDefinitionId[] = []) {
		const definitionIds = this.definitions.map(definition => definition.id)
		const definitionIdSet = new Set(definitionIds)
		const nextOrder = [
			...preferredPrefix,
			...this.rowOrder,
			...definitionIds,
		]
			.filter((id, index, ids) => definitionIdSet.has(id) && ids.indexOf(id) === index)
		this.rowOrder = nextOrder
		return this.rowOrder
	}

}

function fallbackCompare (a: ItemStateOptional, b: ItemStateOptional) {
	return 0
		|| SortDefinitionCompare.compareString(a.instance?.id, b.instance?.id)
		|| SortDefinitionCompare.compareNumber(a.definition?.hash, b.definition?.hash)
}

export default SortManager

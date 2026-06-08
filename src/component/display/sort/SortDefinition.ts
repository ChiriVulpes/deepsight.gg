import type { ComponentName, ComponentNameType } from 'kitsui/utility/StyleManipulator'
import { State } from 'kitsui'
import type { StringApplicatorSource } from 'kitsui/utility/StringApplicator'
import type { ItemStateOptional } from 'model/Items'

export interface SortEntry {
	readonly id: SortDefinitionId
	readonly reverse?: boolean
}

export type SortDefinitionId = ComponentNameType<'sort-row-icon-glyph-'>
export type SortIconClass<ID extends SortDefinitionId = SortDefinitionId> = Extract<ComponentName, `sort-row-icon-glyph--${ID}`>

export interface SortIconDefinition {
	readonly image?: State.Or<string | undefined>
}

export interface SortDefinition<ID extends SortDefinitionId = SortDefinitionId> {
	readonly id: ID
	readonly label: StringApplicatorSource
	readonly shortLabel?: StringApplicatorSource
	readonly icon?: SortIconDefinition
	compare (a: ItemStateOptional, b: ItemStateOptional): number
}

export const Sort = {
	Definition <ID extends SortDefinitionId> (definition: SortDefinition<ID>): SortDefinition<ID> {
		return definition
	},
}

export namespace Sort {
	export type Definition<ID extends SortDefinitionId = SortDefinitionId> = SortDefinition<ID>
	export type Entry = SortEntry
}

export namespace SortDefinitionCompare {
	export function compareString (a: string | undefined, b: string | undefined) {
		return compareDefined(a, b, (a, b) => a.localeCompare(b))
	}

	export function compareNumber (a: number | undefined, b: number | undefined) {
		return compareDefined(a, b, (a, b) => a - b)
	}

	export function compareBoolean (a: boolean | undefined, b: boolean | undefined) {
		return compareNumber(a === undefined ? undefined : +a, b === undefined ? undefined : +b)
	}

	function compareDefined<T> (a: T | undefined, b: T | undefined, compare: (a: T, b: T) => number) {
		if (a === undefined && b === undefined)
			return 0

		if (a === undefined)
			return 1

		if (b === undefined)
			return -1

		return compare(a, b)
	}
}

export default Sort

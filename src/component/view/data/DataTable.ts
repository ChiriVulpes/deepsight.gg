import type { AllComponentNames } from 'conduit.deepsight.gg/DefinitionComponents'

export const VIRTUAL_TABLE_NAMES = ['profiles', 'pgcrs'] as const

export type VirtualTableName = typeof VIRTUAL_TABLE_NAMES[number]
export type DataTableName = AllComponentNames | VirtualTableName

export function isVirtualTableName (table: DataTableName | string): table is VirtualTableName {
	return (VIRTUAL_TABLE_NAMES as readonly string[]).includes(table)
}

export function isComponentTableName (table: DataTableName): table is AllComponentNames {
	return !isVirtualTableName(table)
}

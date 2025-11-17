import type { Quilt } from 'lang'

interface DataComponentHelper<T> {
	getName?(definition: T): string | Quilt.Handler | undefined
	getSubtitle?(definition: T): string | Quilt.Handler | undefined
	getDescription?(definition: T): string | Quilt.Handler | undefined
	getIcon?(definition: T): string | undefined
}

function DataComponentHelper<T> (helper: DataComponentHelper<T>): DataComponentHelper<T> {
	return helper
}

export default DataComponentHelper

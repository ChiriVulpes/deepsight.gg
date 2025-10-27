interface DataComponentHelper<T> {
	getName?(definition: T): string | undefined
	getSubtitle?(definition: T): string | undefined
	getDescription?(definition: T): string | undefined
	getIcon?(definition: T): string | undefined
}

function DataComponentHelper<T> (helper: DataComponentHelper<T>): DataComponentHelper<T> {
	return helper
}

export default DataComponentHelper

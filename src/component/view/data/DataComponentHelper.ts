interface DataComponentHelper<T> {
	getName?(definition: T): string | undefined
	getSubtitle?(definition: T): string | undefined
	getDescription?(definition: T): string | undefined
	getIcon?(definition: T): string | undefined
}

function DataComponentHelper<T> (helper: DataComponentHelper<T>): DataComponentHelper<T> {
	return helper
}

namespace DataComponentHelper {
	export function getComponentName (component: string) {
		return component
			.replace(/([A-Z])/g, ' $1')
			.trimStart()
			.replace(' ', ': ')
			.replace('Definition', '')
	}
}

export default DataComponentHelper

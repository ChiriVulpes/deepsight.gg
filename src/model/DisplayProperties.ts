namespace DisplayProperties {
	export function icon (path: string): string
	export function icon (path: string | undefined): string | undefined
	export function icon (path: string | undefined): string | undefined {
		if (path?.startsWith('http'))
			return path

		if (path?.startsWith('./'))
			return `https://deepsight.gg${path.slice(1)}`

		return path ? `https://www.bungie.net${path}` : undefined
	}
}

export default DisplayProperties

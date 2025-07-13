namespace Script {
	export function allowModuleRedefinition (...paths: string[]) {
		for (const path of paths)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			(window as any).allowRedefine(path)
	}

	export async function reload (path: string) {
		document.querySelector(`script[src^="${path}"]`)?.remove()
		const script = document.createElement('script')
		script.src = `${path}?${Date.now()}`
		return new Promise<void>((resolve, reject) => {
			script.onload = () => resolve()
			script.onerror = reject
			document.head.appendChild(script)
		})
	}
}

export default Script

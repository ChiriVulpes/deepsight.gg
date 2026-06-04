namespace Diagnostic {
	const refs = new Map<string, WeakRef<object>>()
	const announced = new Set<string>()

	export interface Scope<MARK extends string> {
		mark (name: MARK): void
		measure (name: string, start: MARK, end: MARK): void
	}

	export function add<T extends Record<string, object>> (diagnostics: T): void {
		for (const [key, value] of Object.entries(diagnostics)) {
			if (!value || (typeof value !== 'object' && typeof value !== 'function'))
				continue

			refs.set(key, new WeakRef(value))
			Object.defineProperty(window, key, {
				configurable: true,
				get: () => refs.get(key)?.deref(),
			})

			if (!announced.has(key)) {
				announced.add(key)
				console.info(`console available: ${key}`)
			}
		}
	}

	export function scope<MARK extends string> (prefix: string): Scope<MARK> {
		return {
			mark (name) {
				performance.mark(`${prefix}:${name}`)
			},
			measure (name, start, end) {
				try {
					performance.measure(
						`${prefix}:${name}`,
						`${prefix}:${start}`,
						`${prefix}:${end}`,
					)
				}
				catch { }
			},
		}
	}
}

export default Diagnostic

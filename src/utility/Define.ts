type Implementation<P, K extends keyof P> =
	(this: P, ...args: P[K] extends (...args: infer A) => unknown ? A : []) => P[K] extends (...args: any[]) => infer R ? R : never

function Define<P, K extends string & keyof P> (proto: P, key: K, implementation: Implementation<P, K>): void {
	try {
		Object.defineProperty(proto, key, {
			configurable: true,
			writable: true,
			value: implementation,
		})
	}
	catch { }
}

namespace Define {
	export function all<P, K extends string & keyof P> (protos: P[], key: K, implementation: Implementation<P, K>): void {
		for (const proto of protos) {
			Define(proto, key, implementation)
		}
	}

	interface IMagicImplementation<O, K extends string & keyof O> {
		get (this: O): O[K]
		set?(this: O, value: O[K]): void
	}

	export function magic<O, K extends string & keyof O> (obj: O, key: K, implementation: IMagicImplementation<O, K>): void {
		try {
			Object.defineProperty(obj, key, {
				configurable: true,
				...implementation,
			})
		}
		catch { }
	}

	export function set<O, K extends string & keyof O> (obj: O, key: K, value: O[K]): O[K] {
		try {
			Object.defineProperty(obj, key, {
				configurable: true,
				writable: true,
				value,
			})
		}
		catch { }

		return value
	}
}

export default Define

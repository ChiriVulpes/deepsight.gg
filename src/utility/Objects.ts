import type { PromiseOr } from "utility/Type";

namespace Objects {
	export const EMPTY = {};

	export function inherit<T extends { prototype: any }> (obj: any, inherits: T): T["prototype"] {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
		Object.setPrototypeOf(obj, (inherits as any).prototype);
		return obj as T["prototype"];
	}

	export type Key = number | string;
	export type KeyValuePairs<T> = { [KEY in keyof T]: [KEY, T[KEY]] }[keyof T];
	export function map<T, R extends [Key, any]> (object: T, mapper: (pair: KeyValuePairs<T>) => R) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unnecessary-type-assertion
		return Object.fromEntries(Object.entries(object as any).map(mapper as any) as any[]) as { [KEY in R[0]]: R[1] };
	}

	export async function mapAsync<T, R extends [Key, any]> (object: T, mapper: (pair: KeyValuePairs<T>) => Promise<R>) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		return Object.fromEntries(await Promise.all(Object.entries(object as any).map(mapper as any)) as any) as { [KEY in R[0]]: R[1] };
	}

	export function followPath (obj: any, keys: (string | number)[]) {
		for (const key of keys)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			obj = obj?.[key];

		return obj;
	}

	interface JITGet<T> {
		(): PromiseOr<T>;
		compute: () => PromiseOr<T>;
	}

	export function applyJIT<T extends object, K extends keyof T> (obj: T, key: K, compute: () => PromiseOr<T[K]>) {
		const get = (() => {
			const promise = compute();
			delete obj[key];
			obj[key] = promise as T[K];

			if (promise instanceof Promise)
				void promise.then(value => obj[key] = value);

			return promise;
		}) as JITGet<T[K]>;

		get.compute = compute;

		Object.defineProperty(obj, key, {
			configurable: true,
			get,
		});
	}

	export function copyJIT<T extends object, K extends keyof T> (target: T, from: T, key: K) {
		const descriptor = Object.getOwnPropertyDescriptor(from, key);
		if (!descriptor)
			return;

		if ("value" in descriptor) {
			target[key] = from[key];
			return;
		}

		const compute = (descriptor.get as JITGet<T[K]> | undefined)?.compute;
		if (!compute)
			return;

		applyJIT(target, key, compute);
	}
}

export default Objects;

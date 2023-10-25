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
}

export default Objects;

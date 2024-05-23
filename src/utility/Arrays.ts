
namespace Arrays {

	export type Or<T> = T | T[];

	export const EMPTY: [] = [];

	export function resolve<T = never> (or?: Or<T>): T[] {
		return Array.isArray(or) ? or : or === undefined ? [] : [or];
	}

	export function includes (array: Or<any>, value: any): boolean {
		return Array.isArray(array) ? array.includes(value) : array === value;
	}

	export function slice<T> (or: Or<T>): T[] {
		return Array.isArray(or) ? or.slice() : or === undefined ? [] : [or];
	}

	/**
	 * Removes one instance of the given value from the given array.
	 * @returns `true` if removed, `false` otherwise
	 */
	export function remove (array: any[] | undefined, ...values: any[]) {
		if (!array)
			return false;

		let removed = false;
		for (const value of values) {
			const index = array.indexOf(value);
			if (index === -1)
				continue;

			array.splice(index, 1);
			removed = true;
		}

		return removed;
	}

	/**
	 * Removes one instance of the given value from the given array.
	 * @returns `true` if removed, `false` otherwise
	 */
	export function removeSwap (array: any[] | undefined, ...values: any[]) {
		if (!array)
			return false;

		let removed = false;
		for (const value of values) {
			const index = array.indexOf(value);
			if (index === -1)
				continue;

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const swap = array.pop();
			if (!array.length)
				break;

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			array[index] = swap;
			removed = true;
		}

		return removed;
	}

	/**
	 * Adds the given value to the given array if not present.
	 * @returns `true` if added, `false` otherwise
	 */
	export function add (array: any[] | undefined, value: any) {
		if (!array)
			return false;

		const index = array.indexOf(value);
		if (index !== -1)
			return false;

		array.push(value);
		return true;
	}

	export function tuple<VALUES extends any[]> (...values: VALUES): VALUES {
		return values;
	}

	export function range (end: number): number[];
	export function range (start: number, end?: number, step?: number): number[] {
		if (step === 0)
			throw new Error("Invalid step for range");

		const result: number[] = [];

		if (end === undefined)
			end = start, start = 0;

		step = end < start ? -1 : 1;

		for (let i = start; step > 0 ? i < end : i > end; i += step)
			result.push(i);

		return result;
	}

	export function filterNullish<VALUE> (value: VALUE): value is Exclude<VALUE, null | undefined> {
		return value !== null && value !== undefined;
	}

	export function filterFalsy<VALUE> (value: VALUE): value is Exclude<VALUE, null | undefined | 0 | ""> {
		return !!value;
	}

	export function mergeSorted<T> (...arrays: T[][]): T[] {
		return arrays.reduce((prev, curr) => mergeSorted2(prev, curr), []);
	}

	function mergeSorted2<T> (array1: T[], array2: T[]) {
		const merged: T[] = [];

		let index1 = 0;
		let index2 = 0;

		while (index1 < array1.length || index2 < array2.length) {
			const v1 = index1 < array1.length ? array1[index1] : undefined;
			const v2 = index2 < array2.length ? array2[index2] : undefined;

			if (v1 === v2) {
				merged.push(v1!);
				index1++;
				index2++;
				continue;
			}

			if (v1 === undefined && v2 !== undefined) {
				merged.push(v2);
				index2++;
				continue;
			}

			if (v2 === undefined && v1 !== undefined) {
				merged.push(v1);
				index1++;
				continue;
			}

			const indexOfPerson1InList2 = array2.indexOf(v1!, index2);
			if (indexOfPerson1InList2 === -1) {
				merged.push(v1!);
				index1++;
			} else {
				merged.push(v2!);
				index2++;
			}
		}

		return merged;
	}
}

export default Arrays;

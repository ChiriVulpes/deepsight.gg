declare global {
	interface Array<T> {
		/**
		 * Returns the value of the last element in the array where predicate is true, and undefined
		 * otherwise.
		 * @param predicate find calls predicate once for each element of the array, in ascending
		 * order, until it finds one where predicate returns true. If such an element is found, find
		 * immediately returns that element value. Otherwise, find returns undefined.
		 * @param thisArg If provided, it will be used as the this value for each invocation of
		 * predicate. If it is not provided, undefined is used instead.
		 */
		findLast<S extends T> (predicate: (this: void, value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined;
		findLast (predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined;

		/**
		 * Returns the index of the last element in the array where predicate is true, and -1
		 * otherwise.
		 * @param predicate find calls predicate once for each element of the array, in ascending
		 * order, until it finds one where predicate returns true. If such an element is found,
		 * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
		 * @param thisArg If provided, it will be used as the this value for each invocation of
		 * predicate. If it is not provided, undefined is used instead.
		 */
		findLastIndex (predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number;
	}
}

namespace Arrays {
	export function remove (array: any[], value: any) {
		const index = array.indexOf(value);
		if (index === -1)
			return false;

		array.splice(index, 1);
		return true;
	}

	Object.defineProperty(Array.prototype, "findLast", {
		value (this: any[], predicate: (value: any, index: number, obj: any[]) => any) {
			if (this.length > 0)
				for (let i = this.length - 1; i >= 0; i--)
					if (predicate(this[i], i, this))
						return this[i];

			return undefined;
		},
	});

	Object.defineProperty(Array.prototype, "findLastIndex", {
		value (this: any[], predicate: (value: any, index: number, obj: any[]) => any) {
			if (this.length > 0)
				for (let i = this.length - 1; i >= 0; i--)
					if (predicate(this[i], i, this))
						return i;

			return -1;
		},
	});
}

export default Arrays;

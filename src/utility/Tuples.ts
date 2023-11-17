import Arrays from "utility/Arrays";
import type { Falsy } from "utility/Type";

namespace Tuples {
	export function make<VALUES extends any[]> (...values: VALUES): VALUES {
		return values;
	}

	export type TupleFilterNot<I extends 0 | 1 | 2 | 3 | 4 | 5, NOT> =
		<A extends any[]>(value: A) => value is Extract<[...Slice<A>[I], Exclude<A[I], NOT>, ...SliceAfter<A>[IAddOne[I]]], A>;

	const nullishFilters = Object.fromEntries(Arrays.range(6)
		.map(index => make(index, (value: any[]) => value[index] !== undefined && value[index] !== null)));

	export type TupleNullishFilter<I extends 0 | 1 | 2 | 3 | 4 | 5> = TupleFilterNot<I, undefined | null>;
	export function filterNullish<I extends 0 | 1 | 2 | 3 | 4 | 5> (index: I): TupleNullishFilter<I> {
		return nullishFilters[index] as TupleNullishFilter<I>;
	}

	const falsyFilters = Object.fromEntries(Arrays.range(6)
		.map(index => make(index, (value: any[]) => value[index])));

	export type TupleFalsyFilter<I extends 0 | 1 | 2 | 3 | 4 | 5> = TupleFilterNot<I, Falsy>;
	export function filterFalsy<I extends 0 | 1 | 2 | 3 | 4 | 5> (index: I): TupleFalsyFilter<I> {
		return falsyFilters[index] as TupleFalsyFilter<I>;
	}

	export type TupleGetter<I extends 0 | 1 | 2 | 3 | 4 | 5> = <A extends readonly any[]>(value: A) => A[I];
	export function getter<I extends 0 | 1 | 2 | 3 | 4 | 5> (index: I): TupleGetter<I> {
		return tuple => tuple[index];
	}

	export function filter<I extends 0 | 1 | 2 | 3 | 4 | 5, A extends any[], R extends A[I]> (index: I, predicate: (value: A[I], i: number) => value is R): (value: A) => value is Extract<[...Slice<A>[I], R, ...SliceAfter<A>[IAddOne[I]]], A>;
	export function filter<I extends 0 | 1 | 2 | 3 | 4 | 5, A extends any[]> (index: I, predicate: (value: A[I], i: number) => any): (value: A, i: number) => any;
	export function filter<I extends 0 | 1 | 2 | 3 | 4 | 5, A extends any[]> (index: I, predicate: (value: A[I], i: number) => any): (value: A, i: number) => any {
		return (tuple, i) => predicate(tuple[index], i);
	}

	interface Slice<A extends any[]> {
		[0]: [];
		[1]: [A[0]];
		[2]: [A[0], A[1]];
		[3]: [A[0], A[1], A[2]];
		[4]: [A[0], A[1], A[2], A[3]];
		[5]: [A[0], A[1], A[2], A[3], A[4]];
	}

	interface SliceAfter<A extends any[]> {
		[1]: A extends [any, ...infer R] ? R : never;
		[2]: A extends [any, any, ...infer R] ? R : never;
		[3]: A extends [any, any, any, ...infer R] ? R : never;
		[4]: A extends [any, any, any, any, ...infer R] ? R : never;
		[5]: A extends [any, any, any, any, any, ...infer R] ? R : never;
		[6]: A extends [any, any, any, any, any, any, ...infer R] ? R : never;
	}

	interface IAddOne {
		[0]: 1;
		[1]: 2;
		[2]: 3;
		[3]: 4;
		[4]: 5;
		[5]: 6;
	}
}

export default Tuples;

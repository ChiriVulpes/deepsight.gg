import Define from "../Define";

declare global {
	interface IterableIterator<T> {
		toArray (): T[];
	}
	interface Generator<T> {
		toArray (): T[];
	}
}

export default function applyPrototypes () {
	const prototypes = [
		Object.getPrototypeOf([][Symbol.iterator]()),
		Object.getPrototypeOf(new Map().values()),
		Object.getPrototypeOf(new Set().values()),
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		Object.getPrototypeOf(function* () { }).prototype,
	] as IterableIterator<any>[];

	for (const prototype of prototypes) {
		Define(prototype, "toArray", function () {
			return [...this];
		});
	}
}

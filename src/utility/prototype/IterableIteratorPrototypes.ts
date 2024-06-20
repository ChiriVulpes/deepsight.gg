import Define from "../Define";

declare global {
	interface IterableIterator<T> {
		toArray (): T[];
	}
}

export default function applyPrototypes () {
	const Iterator = [].values().constructor as Omit<Function, "prototype"> & { prototype: IterableIterator<any> };
	Define(Iterator.prototype, "toArray", function () {
		return [...this];
	});
}

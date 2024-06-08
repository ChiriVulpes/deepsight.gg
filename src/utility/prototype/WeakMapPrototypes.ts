import Define from "../Define";

declare global {
	interface WeakMap<K, V> {
		compute (key: K, computer: (key: K) => V): V;
	}
}

export default function applyPrototypes () {
	Define(WeakMap.prototype, "compute", function (key, computer) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		let value = this.get(key);
		if (value === undefined) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			value = computer(key);
			this.set(key, value);
		}
		return value;
	});
}

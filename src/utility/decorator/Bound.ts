import type { AnyFunction } from "utility/Type";

export function Bound<T extends AnyFunction> (target: any, key: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> {
	return Bounder(target, key, descriptor);
}

export function Final<T extends AnyFunction> (target: any, key: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> {
	return Bounder(target, key, descriptor);
}

function Bounder<T extends AnyFunction> (target: any, key: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> {
	return {
		configurable: false,
		enumerable: descriptor.enumerable,
		get (): T {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, no-prototype-builtins
			if (!this || this === target.prototype || this.hasOwnProperty(key) || typeof descriptor.value !== "function") {
				return descriptor.value as T;
			}

			const value = descriptor.value.bind(this) as T;

			Object.defineProperty(this, key, {
				configurable: false,
				enumerable: descriptor.enumerable,
				value,
			});

			return value;
		},
	};
}

export default Bound;

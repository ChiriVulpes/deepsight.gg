export type SupplierOr<T, ARGS extends any[] = []> = T | ((...args: ARGS) => T);
export type PromiseOr<T> = T | Promise<T>;
export type AnyFunction<R = any> = (...args: any[]) => R;
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

declare global {
	interface ScreenOrientation {
		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ScreenOrientation/lock) */
		lock?(orientation: OrientationLockType): Promise<void>;
	}
	type OrientationLockType = "any" | "landscape" | "landscape-primary" | "landscape-secondary" | "natural" | "portrait" | "portrait-primary" | "portrait-secondary";
}

declare module "@deepsight.gg/interfaces" {
	interface DeepsightDisplayPropertiesDefinition {
		nameLowerCase?: string;
	}
}
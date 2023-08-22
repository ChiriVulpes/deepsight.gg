export type GetterOfOr<T, ARGS extends any[] = []> = T | ((...args: ARGS) => T);
export type PromiseOr<T> = T | Promise<T>;
export type AnyFunction<R = any> = (...args: any[]) => R;
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

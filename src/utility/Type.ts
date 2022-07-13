export type GetterOfOr<T, ARGS extends any[] = []> = T | ((...args: ARGS) => T);
export type PromiseOr<T> = T | Promise<T>;

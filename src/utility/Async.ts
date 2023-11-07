import type { AnyFunction, Mutable, PromiseOr } from "utility/Type";

namespace Async {

	export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

	/**
	 * Create a promise that will resolve after `ms`.
	 * @param ms The time in milliseconds until the promise will resolve.
	 */
	export async function sleep (ms: number): Promise<undefined>;
	/**
	 * Create a promise that will resolve after `ms`, or when receiving an abort signal.
	 * @param ms The time in milliseconds until the promise will resolve.
	 * @param signal A signal that will cause the promise to immediately resolve. 
	 * @returns `true` if the sleep was aborted, and `false` otherwise.
	 */
	export async function sleep (ms: number, signal: AbortSignal): Promise<boolean>;
	/**
	 * Create a promise that will resolve after `ms`, or when receiving an abort signal.
	 * @param ms The time in milliseconds until the promise will resolve.
	 * @param signal An optional signal that will cause the promise to immediately resolve. 
	 * @returns `undefined` when not provided an `AbortSignal`.
	 * When provided an `AbortSignal`, `true` if the sleep was aborted, and `false` otherwise.
	 */
	export async function sleep (ms: number, signal?: AbortSignal): Promise<boolean | undefined>;
	export async function sleep (ms: number, signal?: AbortSignal): Promise<boolean | undefined> {
		// let stack = new Error().stack;
		// stack = stack?.slice(stack.indexOf("\n") + 1);
		// stack = stack?.slice(stack.indexOf("\n") + 1);
		// stack = stack?.slice(0, stack.indexOf("\n"));
		// console.log("sleep", stack);
		if (!signal) {
			return new Promise<undefined>(resolve => {
				window.setTimeout(() => resolve(undefined), ms);
			});
		}

		if (signal.aborted) {
			return true;
		}

		return new Promise<boolean>(resolve => {
			// eslint-disable-next-line prefer-const
			let timeoutId: number;

			const onAbort = () => {
				window.clearTimeout(timeoutId);
				resolve(true);
			};

			timeoutId = window.setTimeout(() => {
				signal.removeEventListener("abort", onAbort);
				resolve(false);
			}, ms);

			signal.addEventListener("abort", onAbort, { once: true });
		});
	}

	/**
	 * Call the given `callback` with the given `args`.
	 * If the previous call returned a promise that has not resolved or rejected, queue it for after the period ends. 
	 * If there is already a queued call, do nothing.
	 * @param callback The function to call.
	 * @param args The parameters to pass to the callback, when called.
	 * **Note that args passed are temporarily held in memory.** WeakRef them if that's relevant.
	 */
	export function debounce<ARGS extends any[], R> (callback: (...args: ARGS) => Promise<R>, ...args: ARGS): Promise<R>;
	/**
	 * Call the given `callback` with the given `args`.
	 * If the callback has been called within the last `ms` period, queue it for after the period ends. 
	 * If there is already a queued call, do nothing.
	 * @param ms The amount of time that must have passed since the last call.
	 * @param callback The function to call.
	 * @param args The parameters to pass to the callback, when called.
	 * **Note that args passed are temporarily held in memory.** WeakRef them if that's relevant.
	 * @returns The result from the callback, or, if the callback is queued for after the debounce period, 
	 * a promise that will return the result from the queued callback call.
	 */
	export function debounce<ARGS extends any[], R> (ms: number, callback: (...args: ARGS) => R, ...args: ARGS): PromiseOr<R>;
	export function debounce (...args: any[]) {
		let ms: number | undefined;
		let callback: AnyFunction;
		if (typeof args[0] === "function") {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			[callback, ...args] = args;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			return debounceByPromise(callback, ...args);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			[ms, callback, ...args] = args;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			return debounceByTime(ms as number, callback, ...args);
		}
	}

	interface IDebounceByTimeInfo {
		last: number;
		queued?: Promise<any>;
		abortController?: AbortController;
	}

	const debouncedByTime = new WeakMap<AnyFunction, IDebounceByTimeInfo>();
	function debounceByTime<ARGS extends any[], R> (ms: number, callback: (...args: ARGS) => R, ...args: ARGS): PromiseOr<R> {
		let info = debouncedByTime.get(callback);
		if (info && Date.now() - info.last < ms) {
			const newAbortController = new AbortController();
			info.queued = sleep(Date.now() - info.last + ms, newAbortController.signal).then(aborted => {
				if (aborted) {
					return info?.queued;
				}

				delete info!.queued;
				delete info!.abortController;
				info!.last = Date.now();
				return callback(...args);
			});

			info.abortController?.abort();
			info.abortController = newAbortController;
			return info.queued;
		}

		if (!info) {
			debouncedByTime.set(callback, info = { last: 0 });
		}

		info.last = Date.now();
		return callback(...args);
	}

	interface IDebounceByPromiseInfo {
		promise: Promise<any>;
		nextQueued: boolean;
	}

	const debouncedByPromise = new WeakMap<AnyFunction, IDebounceByPromiseInfo>();
	function debounceByPromise<ARGS extends any[]> (callback: (...args: ARGS) => any, ...args: ARGS) {
		const debounceInfo = debouncedByPromise.get(callback);
		if (debounceInfo?.nextQueued) {
			return debounceInfo.promise;
		}

		const realCallback = (): Promise<any> | undefined => {
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const result = callback(...args);
				const promise = Promise.resolve(result);
				debouncedByPromise.set(callback, {
					promise,
					nextQueued: false,
				});
				promise.catch(reason => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					window.dispatchEvent(new PromiseRejectionEvent("unhandledrejection", { promise, reason }));
				});
				return promise;
			} catch (error) {
				window.dispatchEvent(new ErrorEvent("error", { error }));
				return;
			}
		};

		if (debounceInfo) {
			debounceInfo.nextQueued = true;
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			return debounceInfo.promise.catch(realCallback).then(realCallback);
		} else {
			return realCallback();
		}
	}

	export interface IScheduleHandler<ARGS extends any[]> {
		/**
		 * Whether the callback is completed. This is only set to true when the callback is not cancelled.
		 */
		readonly completed: boolean;
		/**
		 * Whether the callback was cancelled. This is set to true if the callback is cancelled due to an abort signal.
		 */
		readonly cancelled: boolean;
		/**
		 * Cancel the scheduled call.
		 */
		cancel (): void;
		/**
		 * Adds a callback for when the call is cancelled. Given the same arguments as parameters as the scheduled callback would have been.
		 */
		onCancel (callback: (...args: ARGS) => any): this;
	}

	/**
	 * Schedule the `callback` for the next tick, with `args` as parameters.
	 * @param callback The function to call.
	 * @param args The parameters to call the callback with.
	 * **Note that args passed are temporarily held in memory.** WeakRef them if that's relevant.
	 * @returns An object containing properties and methods related to this scheduled call.
	 */
	export function schedule<ARGS extends any[]> (callback: (...args: ARGS) => any, ...args: ARGS): IScheduleHandler<ARGS>;
	/**
	 * Schedule the `callback` to be executed after `ms`, with `args` as parameters.
	 * @param ms The time in milliseconds the callback should be executed after.
	 * @param callback The function to call.
	 * @param args The parameters to call the callback with. 
	 * **Note that args passed are temporarily held in memory.** WeakRef them if that's relevant.
	 * @returns An object containing properties and methods related to this scheduled call.
	 */
	export function schedule<ARGS extends any[]> (ms: number, callback: (...args: ARGS) => any, ...args: ARGS): IScheduleHandler<ARGS>;
	/**
	 * Schedule the `callback` to be executed after `ms`, with `args` as parameters. Cancel if receiving abort signal.
	 * @param ms The time in milliseconds the callback should be executed after.
	 * @param signal An abort signal that the scheduled call will be cancelled on, when received.
	 * @param callback The function to call.
	 * @param args The parameters to call the callback with. 
	 * **Note that args passed are temporarily held in memory.** WeakRef them if that's relevant.
	 * @returns An object containing properties and methods related to this scheduled call.
	 */
	export function schedule<ARGS extends any[]> (ms: number, signal: AbortSignal, callback: (...args: ARGS) => any, ...args: ARGS): IScheduleHandler<ARGS>;
	/**
	 * Schedule the `callback` to be executed after `ms`, with `args` as parameters. Cancel if receiving abort signal.
	 * @param ms The time in milliseconds the callback should be executed after.
	 * @param debounceTime The minimum interval between calls of the callback. If set to `true`, uses `ms`. 
	 * This uses the {@link debounce} utility internally, so other debounced calls of that function will also prevent scheduled calls.
	 * Note that `completed` will be set to true on the returned object even if the debounce skips this call.
	 * @param callback The function to call.
	 * @param args The parameters to call the callback with. 
	 * **Note that args passed are temporarily held in memory.** WeakRef them if that's relevant.
	 * @returns An object containing properties and methods related to this scheduled call.
	 */
	export function schedule<ARGS extends any[]> (ms: number, debounceTime: number | true, callback: (...args: ARGS) => any, ...args: ARGS): IScheduleHandler<ARGS>;
	/**
	 * Schedule the `callback` to be executed after `ms`, with `args` as parameters. Cancel if receiving abort signal.
	 * @param ms The time in milliseconds the callback should be executed after.
	 * @param debounceTime The minimum interval between calls of the callback. If set to `true`, uses `ms`. 
	 * This uses the {@link debounce} utility internally, so other debounced calls of that function will also prevent scheduled calls.
	 * Note that `completed` will be set to true on the returned object even if the debounce skips this call.
	 * @param signal An abort signal that the scheduled call will be cancelled on, when received.
	 * @param callback The function to call.
	 * @param args The parameters to call the callback with. 
	 * **Note that args passed are temporarily held in memory.** WeakRef them if that's relevant.
	 * @returns An object containing properties and methods related to this scheduled call.
	 */
	export function schedule<ARGS extends any[]> (ms: number, debounceTime: number | true, signal: AbortSignal, callback: (...args: ARGS) => any, ...args: ARGS): IScheduleHandler<ARGS>;
	export function schedule (...args: any[]) {

		let ms = 0;
		let callback: AnyFunction | undefined;
		let debounceMs: number | boolean = false;
		let signal: AbortSignal | undefined;
		if (typeof args[0] === "function") {
			// (cb, ...args)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			[callback, ...args] = args;

		} else if (typeof args[1] === "function") {
			// (ms, cb, ...args)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			[ms, callback, ...args] = args;

		} else if (typeof args[2] === "function") {
			// (ms, debounce | signal, cb, ...args)
			if (typeof args[1] === "object") {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				[ms, signal, callback, ...args] = args;
			} else {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				[ms, debounceMs, callback, ...args] = args;
			}

		} else {
			// (ms, debounce, signal, cb, ...args)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			[ms, debounceMs, signal, callback, ...args] = args;
		}

		if (debounceMs === true) {
			debounceMs = ms;
		}

		const cancelCallbacks: AnyFunction[] = [];

		// eslint-disable-next-line prefer-const
		let timeoutId: number | undefined;
		const result: Mutable<IScheduleHandler<any[]>> = {
			cancelled: false,
			completed: false,
			cancel: () => {
				if (result.cancelled || result.completed) {
					return;
				}

				signal?.removeEventListener("abort", result.cancel);
				result.cancelled = true;
				window.clearTimeout(timeoutId);
				for (const callback of cancelCallbacks) {
					try {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
						const result = callback(...args);
						const promise = Promise.resolve(result);
						promise.catch(reason => {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							window.dispatchEvent(new PromiseRejectionEvent("unhandledrejection", { promise, reason }));
						});
					} catch (error) {
						window.dispatchEvent(new ErrorEvent("error", { error }));
					}
				}

				cancelCallbacks.length = 0;
				args.length = 0;
			},
			onCancel: callback => {
				if (result.completed) {
					return result;
				}

				if (result.cancelled) {
					try {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
						const result = callback(...args);
						const promise = Promise.resolve(result);
						promise.catch(reason => {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							window.dispatchEvent(new PromiseRejectionEvent("unhandledrejection", { promise, reason }));
						});
					} catch (error) {
						window.dispatchEvent(new ErrorEvent("error", { error }));
					}
				} else {
					cancelCallbacks.push(callback);
				}

				return result;
			},
		};

		signal?.addEventListener("abort", result.cancel, { once: true });

		timeoutId = window.setTimeout(() => {
			if (result.cancelled) {
				return;
			}

			signal?.removeEventListener("abort", result.cancel);
			result.completed = true;
			cancelCallbacks.length = 0;

			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
				const result = debounceMs ? debounce(debounceMs as number, callback!, ...args) : callback!(...args);
				const promise = Promise.resolve(result);
				promise.catch(reason => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					window.dispatchEvent(new PromiseRejectionEvent("unhandledrejection", { promise, reason }));
				});
			} catch (error) {
				window.dispatchEvent(new ErrorEvent("error", { error }));
			}
		}, ms);

		return result;
	}

	/**
	 * Create an AbortSignal that will be emitted after `ms`.
	 * @param ms The time until the signal will be emitted.
	 * @param controller An optional existing `AbortController`.
	 * @param message An optional custom timeout message.
	 */
	export function timeout (ms: number, controller = new AbortController(), message = `Timed out after ${ms} ms`): AbortSignal {
		schedule(ms, () => controller.abort(message));
		return controller.signal;
	}
}

export default Async;

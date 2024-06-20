import type { ICachedModel, IModelCache } from "model/ModelCacheDatabase";
import ModelCacheDatabase from "model/ModelCacheDatabase";
import Arrays from "utility/Arrays";
import Database from "utility/Database";
import Bungie from "utility/endpoint/bungie/Bungie";
import { EventManager } from "utility/EventManager";
import Maths from "utility/maths/Maths";
import Store from "utility/Store";
import type { AnyFunction } from "utility/Type";
import URL from "utility/URL";

export interface IModelEvents<R> {
	loading: Event;
	loaded: { value: R, fresh: boolean };
	errored: { error: Error };
	loadUpdate: { progress: number, messages: string[] };
	invalidCache: Event;
}

export interface IModelGenerationApi {
	setCacheTime (cacheTimeSupplier: () => number): void;
	emitProgress (progress: number, messages?: string | string[]): void;
	subscribeProgress (model: Model<any>, amount: number, from?: number): this;
	subscribeProgressAndWait<R> (model: Model<any, R>, amount: number, from?: number): Promise<R>;
	subscribeProgressAndWaitAll<MODELS extends Model<any, any>[]> (models: MODELS, amount: number, from?: number): Promise<{ [INDEX in keyof MODELS]: MODELS[INDEX] extends Model<any, infer R> ? R : never }>;
}

export interface IModel<T, R, API = undefined> {
	cache: "Global" | "Session" | "Memory" | false;
	resetTime?: "Daily" | "Weekly" | "Trials" | number;
	version?: string | number | (() => Promise<string | number | undefined>);
	api?: API;
	useCacheOnError?: true;
	/**
	 * On initial load, assuming the cached data is not older than the provided elapsed ms, it will be used instead.
	 */
	useCacheOnInitial?: number;
	resetOnDestinyMembershipChange?: true;
	generate?(api: IModelGenerationApi): Promise<T>;
	process?(value: T): R;
	reset?(value?: T): any;
	cacheInvalidated?(value?: T): any;
}

type Model<T, R = T> = Model.Impl<T, R>;

namespace Model {

	export type Resolve<MODEL extends Model<any, any>> = MODEL extends Model<any, infer R> ? R : never;
	export type ResolveList<MODELS extends readonly Model<any, any>[]> = { [KEY in keyof MODELS]: MODELS[KEY] extends Model<any, infer R> ? R : never };

	export const cacheDB = new Database(ModelCacheDatabase);

	export interface IModelGlobalEvents {
		clearCache: Event;
	}
	export const event = EventManager.make<IModelGlobalEvents>();

	let loadId = Date.now();
	export async function clearCache (force = false) {
		console.warn("Clearing cache...");
		loadId = Date.now();

		if (force) {
			await cacheDB.dispose();
			console.warn("Cache cleared.");
			event.emit("clearCache");
			return;
		}

		for (const store of (await cacheDB.stores()) as Iterable<keyof IModelCache>) {
			if (store === "models") {
				for (const key of await cacheDB.keys("models")) {
					const cached = await cacheDB.get("models", key);
					if (cached?.persist && !force)
						continue;

					await cacheDB.delete("models", key);
				}
			} else if (force) {
				await cacheDB.clear(store);
			}
		}

		console.warn("Cache cleared.");
		event.emit("clearCache");
	}

	/**
	 * Custom model implementation
	 */
	export function create<T, R = T, API = undefined> (name: string, model: IModel<T, R, API>) {
		return new Impl(name, model) as undefined extends API ? Impl<T, R> : Impl<T, R> & API;
	}

	/**
	 * Data not cached, with optional name
	 */
	export function createTemporary<T> (generate: IModel<T, T>["generate"], name = "") {
		return new Impl(name, {
			cache: false,
			generate,
		});
	}

	/** 
	 * Data cached only in memory, with optional reset time & name
	 */
	export function createDynamic<T> (resetTime: Exclude<IModel<T, T>["resetTime"], undefined>, generate: IModel<T, T>["generate"], name = "") {
		return new Impl(name, {
			cache: "Memory",
			resetTime,
			generate,
		});
	}

	let resetting = 0;
	export class Impl<T, R = T> {

		public readonly event = new EventManager<this, IModelEvents<R>>(this);

		private value?: R | Promise<R>;
		private cacheTime?: number;
		private version?: string | number;
		private _loadingInfo?: { progress: number, messages: string[] };
		private loadId = loadId;
		private errored = false;
		private _latest?: R;

		private modelVersion?: string | number;
		private async getModelVersion () {
			this.modelVersion ??= (await (typeof this.model.version === "function" ? this.model.version() : this.model.version)) ?? 0;
			return this.modelVersion;
		}

		public getCacheTime () {
			return this.cacheTime ?? Date.now();
		}

		public get loading () {
			return this.value === undefined
				|| this.value instanceof Promise
				|| (this.model.cache ? !this.isCacheValid() : false);
		}

		public get loadingInfo () {
			return this._loadingInfo;
		}

		public get latest () {
			return this._latest;
		}

		public constructor (private readonly name: string, private readonly model: IModel<T, R, any>) {
			Object.assign(this, model.api);

			if (model.resetOnDestinyMembershipChange) {
				const reset = async () => {
					resetting++;
					await this.reset();
					resetting--;
					if (!resetting) {
						// eslint-disable-next-line no-self-assign
						URL.path = URL.path;
						// eslint-disable-next-line no-self-assign
						location.href = location.href;
					}
				};

				Store.event.subscribe("setDestinyMembershipOverride", reset);
				Store.event.subscribe("deleteDestinyMembershipOverride", reset);
				Bungie.event.subscribe("resetAuthentication", reset);
				Bungie.event.subscribe("authenticated", event => event.authType === "new" && reset());
			}
		}

		public isCacheValid (cacheTime = this.cacheTime, version = this.version, resetTime = this.model.resetTime) {
			if (cacheTime === undefined)
				return false;

			if (this.loadId !== loadId)
				return false;

			if (this.modelVersion === undefined || this.modelVersion !== version)
				return false;

			if (!this.model.cache)
				return false;

			if (resetTime === undefined)
				return true;

			if (typeof resetTime === "number")
				return Date.now() < cacheTime + resetTime;

			return cacheTime > Bungie[`last${resetTime}Reset`];
		}

		public async resolveCache (includeExpired: boolean | "initial" = false) {
			if (!this.model.cache || this.model.cache === "Memory")
				return undefined;

			const cached = await Model.cacheDB.get("models", this.name) as ICachedModel<T> | undefined;
			if (!cached)
				return undefined;

			await this.getModelVersion();
			if (includeExpired === true || this.isCacheValid(cached.cacheTime, cached.version, includeExpired === "initial" ? this.model.useCacheOnInitial : undefined)) {
				// this cached value is valid
				console.debug(`Using cached data for '${this.name}', cached at ${new Date(cached.cacheTime).toLocaleString()}`);
				this._latest = this.value = (this.model.process?.(cached.value) ?? cached.value ?? null) as R;
				this.cacheTime = cached.cacheTime;
				this.version = cached.version;
				this.event.emit("loaded", { value: this.value ?? undefined as any as R, fresh: false });
				return this.value ?? undefined as any as R;
			}

			// we don't purge the data anymore so that deepsight.gg can show your inventory even if bungie's api is down
			// console.debug(`Purging expired cache data for '${this.name}'`);
			// await this.reset();
			this.model.cacheInvalidated?.(cached.value);
			this.event.emit("invalidCache");
			return undefined;
		}

		public async reset (value?: T) {
			if (!this.model.reset)
				this._latest = this.value = value = undefined;
			else {
				if (!value) {
					const cached = await Model.cacheDB.get("models", this.name);
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					value = cached?.value;
				}

				await this.model.reset?.(value);
			}

			await Model.cacheDB.delete("models", this.name);
			delete this.modelVersion;
			await this.getModelVersion();
		}

		public get () {
			if (this.value !== undefined && !(this.value instanceof Promise))
				if (!this.isCacheValid())
					delete this.value;

			if (this.value === undefined || this.errored) {
				if (this.name)
					console.debug(`No value in memory for '${this.name}'`);

				this.event.emit("loading");

				// eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
				const promise = new Promise<R>(async (resolve, reject) => {
					if (this.model.cache && this.model.cache !== "Memory") {
						const cached = await this.resolveCache();
						if (cached)
							return resolve(cached);
					}

					if (!this.model.generate)
						// this model can't be generated on its own, it must be initialised instead
						// in this case, wait for the loaded event and return the new value
						return resolve(this.event.waitFor("loaded")
							.then(({ value }) => value));

					const subscriptions = new Map<Model<any>, AnyFunction>();

					let lastMessage: string[] = [];
					const api: IModelGenerationApi = {
						setCacheTime: (cacheTimeSupplier) => this.getCacheTime = cacheTimeSupplier,
						emitProgress: (progress, messages: Arrays.Or<string>, bubbled = false) => {
							messages = Arrays.resolve(messages);
							this._loadingInfo = { progress, messages };
							// console.debug(`Load progress ${Math.floor(progress * 100)}%: ${messages.join(" ") || "Loading"}`);
							if (!bubbled) {
								lastMessage = messages;
								for (const [model, handleSubUpdate] of [...subscriptions]) {
									model.event.unsubscribe("loadUpdate", handleSubUpdate);
									subscriptions.delete(model);
								}
							}
							this.event.emit("loadUpdate", { progress, messages });
						},
						subscribeProgress: (model, amount, from = 0) => {
							if (model.loading) {
								if (subscriptions.has(model))
									return api;

								const handleSubUpdate = ({ progress: subAmount, messages }: IModelEvents<any>["loadUpdate"]) =>
									// eslint-disable-next-line @typescript-eslint/no-unsafe-call
									(api.emitProgress as any)(from + subAmount * amount, [...messages, ...lastMessage].filter(m => m), true);
								model.event.subscribe("loadUpdate", handleSubUpdate);
								subscriptions.set(model, handleSubUpdate);
								model.event.subscribeOnce("loaded", () => {
									model.event.unsubscribe("loadUpdate", handleSubUpdate);
									subscriptions.delete(model);
								});
							}

							return api;
						},
						subscribeProgressAndWait: (model, amount, from) => {
							api.subscribeProgress(model, amount, from);
							return model.await();
						},
						subscribeProgressAndWaitAll: (models, amount, from = 0): Promise<any> => {
							const progresses: number[] = models.map(() => 0);
							const messageses: string[][] = models.map(() => []);
							for (let i = 0; i < models.length; i++) {
								const model = models[i];
								if (!model.loading || subscriptions.has(model)) {
									progresses[i] = 1;
									continue;
								}

								const handleSubUpdate = ({ progress: subAmount, messages }: IModelEvents<any>["loadUpdate"]) => {
									const progress = from + subAmount * amount;
									progresses[i] = progress;
									messageses[i] = messages;
									// eslint-disable-next-line @typescript-eslint/no-unsafe-call
									(api.emitProgress as any)(Maths.average(...progresses), [...messageses.flat(), ...lastMessage].filter(m => m), true);
								};
								model.event.subscribe("loadUpdate", handleSubUpdate);
								subscriptions.set(model, handleSubUpdate);
								model.event.subscribeOnce("loaded", () => {
									model.event.unsubscribe("loadUpdate", handleSubUpdate);
									subscriptions.delete(model);
								});
							}

							return Promise.all(models.map(model => model.await()));
						},
					};

					const generated = Promise.resolve(this.model.generate?.(api));

					void generated.catch(async error => {
						console.error(`Model '${this.name}' failed to load:`, error);

						if (this.model.useCacheOnError) {
							const cached = await this.resolveCache(true);
							if (cached) {
								api.emitProgress(1);
								return resolve(cached);
							}
						}

						this.event.emit("errored", { error: error as Error });
						this.errored = true;
						api.emitProgress(1);
						reject(error);
					});

					void generated.then(async value => {
						const result = await this.set(value);
						api.emitProgress(1);
						resolve(result);
					});
				});

				this.errored = false;
				this.value = promise ?? null;

				return undefined;
			}

			if (this.value instanceof Promise)
				return undefined;

			return this.value ?? undefined;
		}

		protected async set (value: T) {
			const filtered = (this.model.process?.(value) ?? value) as R;
			this._latest = this.value = (filtered ?? null) as R;
			this.cacheTime = Date.now();
			this.version = await this.getModelVersion();
			this.loadId = loadId;

			if (this.model.cache && this.model.cache !== "Memory") {
				const cached: ICachedModel<T> = { cacheTime: this.cacheTime, value, version: this.version };
				if (this.model.cache === "Global")
					cached.persist = true;
				void Model.cacheDB.set("models", this.name, cached);
			}

			this.event.emit("loaded", { value: filtered, fresh: true });
			if (this.name)
				console.debug(`${!this.model.cache || this.model.cache === "Memory" ? "Loaded" : "Cached"} data for '${this.name}'`);

			return filtered;
		}

		public async await (api?: IModelGenerationApi, amount = 1, from = 0) {
			if (api)
				return api.subscribeProgressAndWait(this, amount, from);

			return this.get() ?? (await Promise.resolve(this.value)) ?? undefined as any as R | Promise<R>;
		}
	}
}

export default Model;

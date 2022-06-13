import type { ICachedModel, IModelCache } from "model/ModelCacheDatabase";
import ModelCacheDatabase from "model/ModelCacheDatabase";
import Database from "utility/Database";
import Bungie from "utility/endpoint/bungie/Bungie";
import { EventManager } from "utility/EventManager";
import Time from "utility/Time";

export interface IModelEvents<R> {
	loading: Event;
	loaded: { value: R };
	errored: { error: Error };
	loadUpdate: { progress: number, message?: string };
}

export interface IModelGenerationApi {
	emitProgress (progress: number, message?: string): void;
	subscribeProgress (model: Model<any>, amount: number, from?: number): this;
}

export interface IModel<T, R> {
	cache: "Global" | "Session" | false;
	resetTime?: "Daily" | "Weekly" | number;
	generate?(api: IModelGenerationApi): Promise<T>;
	filter?(value: T): R;
	reset?(value?: T): any;
}

type Model<T, R = T> = Model.Impl<T, R>;

namespace Model {

	export type Resolve<MODELS extends readonly Model<any, any>[]> = { [KEY in keyof MODELS]: MODELS[KEY] extends Model<any, infer R> ? R : never };

	export const cacheDB = new Database(ModelCacheDatabase);

	export async function clearCache () {
		console.warn("Clearing cache...");
		// if (!cacheDB)
		// 	return;

		for (const store of (await cacheDB.stores()) as Iterable<keyof IModelCache>) {
			if (store === "models") {
				for (const key of await cacheDB.keys("models")) {
					const cached = await cacheDB.get("models", key);
					if (cached?.persist)
						continue;

					await cacheDB.delete("models", key);
				}
			} else {
				// await cacheDB.clear(store);
			}
		}
	}

	export function create<T, R = T> (name: string, model: IModel<T, R>) {
		return new Impl(name, model);
	}

	export function createTemporary<T> (generate: IModel<T, T>["generate"]) {
		return new Impl("", {
			cache: false,
			generate,
		});
	}

	export function createDynamic<T> (resetTime: Exclude<IModel<T, T>["resetTime"], undefined>, generate: IModel<T, T>["generate"]) {
		return new Impl("", {
			cache: false,
			resetTime,
			generate,
		});
	}

	export class Impl<T, R = T> {

		public readonly event = new EventManager<this, IModelEvents<R>>(this);

		private value?: R | Promise<R>;
		private cacheTime?: number;
		private _loadingInfo?: { progress: number, message?: string };

		public get loading () {
			return this.value === undefined
				|| this.value instanceof Promise
				|| !this.isCacheTimeValid();
		}

		public get loadingInfo () {
			return this._loadingInfo;
		}

		public constructor (private readonly name: string, private readonly model: IModel<T, R>) { }

		public isCacheTimeValid (cacheTime = this.cacheTime) {
			if (cacheTime === undefined)
				return false;

			if (this.model.resetTime === undefined)
				return true;

			const resetTime = this.model.resetTime ?? 0;
			return cacheTime > (typeof resetTime === "number" ? Time.floor(resetTime) : Bungie[`last${resetTime}Reset`]);
		}

		public async resolveCache () {
			if (!this.model.cache)
				return undefined;

			const cached = await Model.cacheDB.get("models", this.name) as ICachedModel<T> | undefined;
			if (!cached)
				return undefined;

			if (this.isCacheTimeValid(cached.cacheTime)) {
				// this cached value is valid
				console.info(`Using cached data for '${this.name}', cached at ${new Date(cached.cacheTime).toLocaleString()}`)
				this.value = (this.model.filter?.(cached.value) ?? cached.value) as R;
				this.cacheTime = cached.cacheTime;
				this.event.emit("loaded", { value: this.value });
				return this.value;
			}

			console.info(`Purging expired cache data for '${this.name}'`);
			await this.reset();
			return undefined;
		}

		public async reset (value?: T) {
			if (!value) {
				const cached = await Model.cacheDB.get("models", this.name);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				value = cached?.value;
			}
			await this.model.reset?.(value);
			await Model.cacheDB.delete("models", this.name);
		}

		public get () {
			if (this.value !== undefined && !(this.value instanceof Promise))
				if (!this.isCacheTimeValid())
					delete this.value;

			if (this.value === undefined) {
				if (this.name)
					console.info(`No value in memory for '${this.name}'`);

				this.event.emit("loading");

				// eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
				const promise = new Promise<R>(async resolve => {
					if (this.model.cache) {
						const cached = await this.resolveCache();
						if (cached)
							return resolve(cached);
					}

					if (!this.model.generate)
						// this model can't be generated on its own, it must be initialised instead
						// in this case, wait for the loaded event and return the new value
						return resolve(this.event.waitFor("loaded")
							.then(({ value }) => value));

					const api: IModelGenerationApi = {
						emitProgress: (progress, message) => {
							this._loadingInfo = { progress, message };
							this.event.emit("loadUpdate", { progress, message });
						},
						subscribeProgress: (model, amount, from = 0) => {
							if (model.loading) {
								const handleSubUpdate = ({ progress: subAmount, message }: IModelEvents<any>["loadUpdate"]) =>
									api.emitProgress(from + subAmount * amount, message);
								model.event.subscribe("loadUpdate", handleSubUpdate);
								model.event.subscribe("loaded", () =>
									model.event.unsubscribe("loadUpdate", handleSubUpdate));
							}

							return api;
						},
					};

					const generated = this.model.generate?.(api);

					void generated.catch(error => {
						console.error(`Model '${this.name}' failed to load:`, error);
						this.event.emit("errored", { error: error as Error });
					});

					void generated.then(async value => {
						resolve(await this.set(value));
					});
				});

				this.value = promise;

				return undefined;
			}

			if (this.value instanceof Promise)
				return undefined;

			return this.value;
		}

		protected async set (value: T) {
			const filtered = (this.model.filter?.(value) ?? value) as R;
			this.value = filtered;
			this.cacheTime = Date.now();

			if (this.model.cache) {
				const cached: ICachedModel<T> = { cacheTime: this.cacheTime, value };
				if (this.model.cache === "Global")
					cached.persist = true;
				await Model.cacheDB.set("models", this.name, cached);
			}

			this.event.emit("loaded", { value: filtered });
			if (this.name)
				console.info(`${!this.model.cache ? "Loaded" : "Cached"} data for '${this.name}'`);

			return filtered;
		}

		public async await () {
			return this.get() ?? this.value as R | Promise<R>;
		}
	}
}

export default Model;

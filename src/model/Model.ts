import type { ICachedModel, IModelCache } from "model/ModelCacheDatabase";
import ModelCacheDatabase from "model/ModelCacheDatabase";
import Database from "utility/Database";
import Bungie from "utility/endpoint/bungie/Bungie";
import { EventManager } from "utility/EventManager";

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
	cache: "Global" | "Session" | "Memory" | false;
	resetTime?: "Daily" | "Weekly" | number;
	version?: string | number | (() => Promise<string | number | undefined>);
	generate?(api: IModelGenerationApi): Promise<T>;
	filter?(value: T): R;
	reset?(value?: T): any;
}

type Model<T, R = T> = Model.Impl<T, R>;

namespace Model {

	export type Resolve<MODELS extends readonly Model<any, any>[]> = { [KEY in keyof MODELS]: MODELS[KEY] extends Model<any, infer R> ? R : never };

	export const cacheDB = new Database(ModelCacheDatabase);

	let loadId = Date.now();
	export async function clearCache (force = false) {
		console.warn("Clearing cache...");
		loadId = Date.now();

		if (force)
			return cacheDB.dispose();

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
			cache: "Memory",
			resetTime,
			generate,
		});
	}

	export class Impl<T, R = T> {

		public readonly event = new EventManager<this, IModelEvents<R>>(this);

		private value?: R | Promise<R>;
		private cacheTime?: number;
		private version?: string | number;
		private _loadingInfo?: { progress: number, message?: string };
		private loadId = loadId;
		private errored = false;

		private modelVersion?: string | number;
		private async getModelVersion () {
			this.modelVersion ??= (await (typeof this.model.version === "function" ? this.model.version() : this.model.version)) ?? 0;
			return this.modelVersion;
		}

		public get loading () {
			return this.value === undefined
				|| this.value instanceof Promise
				|| (this.model.cache ? !this.isCacheValid() : false);
		}

		public get loadingInfo () {
			return this._loadingInfo;
		}

		public constructor (private readonly name: string, private readonly model: IModel<T, R>) { }

		public isCacheValid (cacheTime = this.cacheTime, version = this.version) {
			if (cacheTime === undefined)
				return false;

			if (this.loadId !== loadId)
				return false;

			if (this.modelVersion === undefined || this.modelVersion !== version)
				return false;

			if (!this.model.cache)
				return false;

			if (this.model.resetTime === undefined)
				return true;

			const resetTime = this.model.resetTime;
			if (typeof resetTime === "number")
				return Date.now() < cacheTime + resetTime;

			return cacheTime > Bungie[`last${resetTime}Reset`];
		}

		public async resolveCache () {
			if (!this.model.cache || this.model.cache === "Memory")
				return undefined;

			const cached = await Model.cacheDB.get("models", this.name) as ICachedModel<T> | undefined;
			if (!cached)
				return undefined;

			await this.getModelVersion();
			if (this.isCacheValid(cached.cacheTime, cached.version)) {
				// this cached value is valid
				console.debug(`Using cached data for '${this.name}', cached at ${new Date(cached.cacheTime).toLocaleString()}`)
				this.value = (this.model.filter?.(cached.value) ?? cached.value) as R;
				this.cacheTime = cached.cacheTime;
				this.version = cached.version;
				this.event.emit("loaded", { value: this.value });
				return this.value;
			}

			console.debug(`Purging expired cache data for '${this.name}'`);
			await this.reset();
			return undefined;
		}

		public async reset (value?: T) {
			if (!this.model.reset)
				this.value = value = undefined;
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
								model.event.subscribeFirst("loaded", () =>
									model.event.unsubscribe("loadUpdate", handleSubUpdate));
							}

							return api;
						},
					};

					const generated = this.model.generate?.(api);

					void generated.catch(error => {
						console.error(`Model '${this.name}' failed to load:`, error);
						this.event.emit("errored", { error: error as Error });
						this.errored = true;
						reject(error);
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
			this.version = await this.getModelVersion();
			this.loadId = loadId;

			if (this.model.cache && this.model.cache !== "Memory") {
				const cached: ICachedModel<T> = { cacheTime: this.cacheTime, value, version: this.version };
				if (this.model.cache === "Global")
					cached.persist = true;
				void Model.cacheDB.set("models", this.name, cached);
			}

			this.event.emit("loaded", { value: filtered });
			if (this.name)
				console.debug(`${!this.model.cache || this.model.cache === "Memory" ? "Loaded" : "Cached"} data for '${this.name}'`);

			return filtered;
		}

		public async await () {
			return this.get() ?? this.value as R | Promise<R>;
		}
	}
}

export default Model;

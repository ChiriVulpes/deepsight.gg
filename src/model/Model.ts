import type { ICachedModel } from "model/ModelCacheDatabase";
import ModelCacheDatabase from "model/ModelCacheDatabase";
import Bungie from "utility/bungie/Bungie";
import Database from "utility/Database";
import { EventManager } from "utility/EventManager";
import Time from "utility/Time";

export interface IModelEvents<R> {
	loading: Event;
	loaded: { value: R };
	errored: { error: Error };
}

export interface IModel<T, R> {
	cache: /*"Global" |*/ "Session" | false;
	resetTime?: "Daily" | "Weekly" | number;
	generate?(): Promise<T>;
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

		await cacheDB.clear("models");
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

		public get loading () {
			return this.value === undefined
				|| this.value instanceof Promise
				|| !this.isCacheTimeValid();
		}

		public constructor (private readonly name: string, private readonly model: IModel<T, R>) { }

		public isCacheTimeValid (cacheTime = this.cacheTime) {
			if (this.model.cache !== "Session")
				return true;

			if (cacheTime === undefined)
				return false;

			const resetTime = this.model.resetTime ?? 0;
			return cacheTime > (typeof resetTime === "number" ? Time.floor(resetTime) : Bungie[`last${resetTime}Reset`]);
		}

		public async resolveCache () {
			if (this.model.cache !== "Session")
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
			if (this.value === undefined) {
				if (this.name)
					console.info(`No value in memory for '${this.name}'`);

				this.event.emit("loading");

				// eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
				const promise = new Promise<R>(async resolve => {
					if (this.model.cache === "Session") {
						const cached = await this.resolveCache();
						if (cached)
							return resolve(cached);
					}

					if (!this.model.generate)
						// this model can't be generated on its own, it must be initialised instead
						// in this case, wait for the loaded event and return the new value
						return resolve(this.event.waitFor("loaded")
							.then(({ value }) => value));

					const generated = this.model.generate?.();

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

			if (this.model.cache === "Session") {
				const cached: ICachedModel<T> = { cacheTime: Date.now(), value };
				this.cacheTime = cached.cacheTime;
				await Model.cacheDB.set("models", this.name, cached);
			}

			this.event.emit("loaded", { value: filtered });
			if (this.name)
				console.info(`${this.model.cache === "Session" ? "Cached" : "Loaded"} data for '${this.name}'`);

			return filtered;
		}

		public async await () {
			return this.get() ?? this.value as R | Promise<R>;
		}
	}
}

export default Model;

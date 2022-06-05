import ModelCacheDatabase, { ICachedModel } from "model/ModelCacheDatabase";
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
	noCache?: true;
	resetTime: "Daily" | "Weekly" | number;
	generate (): Promise<T>;
	filter?(value: T): R;
}

export default class Model<T, R = T> {

	private static cacheDB = new Database(ModelCacheDatabase);

	public static async clearCache () {
		console.warn("Clearing cache...");
		if (!this.cacheDB)
			return;

		await this.cacheDB.clear("models");
	}

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
		if (cacheTime === undefined)
			return false;

		const resetTime = this.model.resetTime;
		return cacheTime > (typeof resetTime === "number" ? Time.floor(resetTime) : Bungie[`last${resetTime}Reset`]);
	}

	public async resolveCache () {
		const cached = await Model.cacheDB.get("models", this.name) as ICachedModel<T> | undefined;
		if (!cached)
			return undefined;

		if (this.isCacheTimeValid(cached.cacheTime)) {
			// this cached value is valid
			console.info(`Using cached data for '${this.name}', cached at ${new Date(cached.cacheTime).toLocaleString()}`)
			this.value = (this.model.filter?.(cached.value) ?? cached.value) as R;
			this.event.emit("loaded", { value: this.value });
			return this.value;
		}

		console.info(`Purging expired cache data for '${this.name}'`);
		await Model.cacheDB.delete("models", this.name);
	}

	public async reset () {
		await Model.cacheDB.delete("models", this.name);
	}

	public get () {
		if (this.value === undefined) {
			this.event.emit("loading");

			// eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
			this.value = new Promise<R>(async resolve => {
				if (!this.model.noCache) {
					const cached = await this.resolveCache();
					if (cached)
						return cached;
				}

				const generated = this.model.generate();

				void generated.catch(error => {
					console.error(`Model '${this.name}' failed to load:`, error);
					this.event.emit("errored", { error: error as Error });
				});

				void generated.then(async value => {
					await this.set(value);
					resolve(this.value!);
				});
			});

			return undefined;
		}

		if (this.value instanceof Promise)
			return undefined;

		return this.value;
	}

	protected async set (value: T) {
		this.value = (this.model.filter?.(value) ?? value) as R;

		if (!this.model.noCache) {
			const cached: ICachedModel<T> = { cacheTime: Date.now(), value };
			this.cacheTime = cached.cacheTime;
			await Model.cacheDB.set("models", this.name, cached);
		}

		this.event.emit("loaded", { value: this.value });
		console.info(`${this.model.noCache ? "Loaded" : "Cached"} data for '${this.name}'`);
	}

	public async await () {
		return this.get() ?? this.value as R | Promise<R>;
	}
}

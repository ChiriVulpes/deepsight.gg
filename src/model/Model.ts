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

	public get loading () {
		return this.value === undefined || this.value instanceof Promise;
	}

	public constructor (private readonly name: string, private readonly model: IModel<T, R>) { }

	public async reset () {
		await Model.cacheDB.delete("models", this.name);
	}

	public get () {
		if (this.value === undefined) {
			this.event.emit("loading");

			// eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
			this.value = new Promise<R>(async resolve => {
				const cached = await Model.cacheDB.get("models", this.name) as ICachedModel<T> | undefined;
				if (cached) {
					const resetTime = this.model.resetTime;
					if (cached.cacheTime > (typeof resetTime === "number" ? Time.floor(resetTime) : Bungie[`last${resetTime}Reset`])) {
						// this cached value is valid
						console.info(`Using cached data for '${this.name}', cached at ${new Date(cached.cacheTime).toLocaleString()}`)
						this.value = (this.model.filter?.(cached.value) ?? cached.value) as R;
						this.event.emit("loaded", { value: this.value });
						resolve(this.value);
						return;
					}

					console.info(`Purging expired cache data for '${this.name}'`);
					await Model.cacheDB.delete("models", this.name);
				}

				const generated = this.model.generate();

				void generated.catch(error => {
					console.error(`Model '${this.name}' failed to load:`, error);
					this.event.emit("errored", { error: error as Error });
				});

				void generated.then(async value => {
					this.value = (this.model.filter?.(value) ?? value) as R;
					const cached: ICachedModel<T> = { cacheTime: Date.now(), value };
					await Model.cacheDB.set("models", this.name, cached);
					this.event.emit("loaded", { value: this.value });
					console.info(`Cached data for '${this.name}'`);
					resolve(this.value);
				});
			});

			return undefined;
		}

		if (this.value instanceof Promise)
			return undefined;

		return this.value;
	}

	public async await () {
		return this.get() ?? this.value as R | Promise<R>;
	}
}

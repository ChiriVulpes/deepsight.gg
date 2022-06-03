import Bungie from "utility/bungie/Bungie";
import { EventManager } from "utility/EventManager";
import Time from "utility/Time";

interface ICachedModel<T> {
	cacheTime: number;
	value: T;
}

export interface IModelEvents<T> {
	loading: Event;
	loaded: { value: T };
	errored: { error: Error };
}

export interface IModel<T> {
	resetTime: "Daily" | "Weekly" | number;
	generate (): Promise<T>;
}

export default class Model<T> {

	public static clearCache () {
		console.warn("Clearing cache...");
		for (const key of Object.keys(localStorage)) {
			if (key.startsWith("modelCache/")) {
				console.info("Uncached", key);
				localStorage.removeItem(key);
			}
		}
	}

	public readonly event = new EventManager<this, IModelEvents<T>>(this);

	private value?: T | Promise<T>;

	public get loading () {
		return this.value === undefined;
	}

	public constructor (private readonly name: string, private readonly model: IModel<T>) { }

	public get () {
		if (this.value === undefined) {
			this.event.emit("loading");
			const id = `modelCache/${this.name}`;

			const cachedString = localStorage.getItem(id);
			if (cachedString) {
				const cached = JSON.parse(cachedString) as ICachedModel<T>;

				const resetTime = this.model.resetTime;
				if (cached.cacheTime > (typeof resetTime === "number" ? Time.floor(resetTime) : Bungie[`last${resetTime}Reset`])) {
					// this cached value is valid
					console.info(`Using cached data for '${this.name}', cached at ${new Date(cached.cacheTime).toLocaleString()}`)
					this.event.emit("loaded", { value: cached.value });
					return this.value = cached.value;
				}

				localStorage.removeItem(id);
			}

			this.value = this.model.generate();

			void this.value.catch(error => {
				console.error(`Model '${this.name}' failed to load:`, error);
				this.event.emit("errored", { error: error as Error });
			});

			void this.value.then(value => {
				this.value = value;
				const cached: ICachedModel<T> = { cacheTime: Date.now(), value };
				localStorage.setItem(id, JSON.stringify(cached));
				this.event.emit("loaded", { value: value });
			});

			return undefined;
		}

		if (this.value instanceof Promise)
			return undefined;

		return this.value;
	}

	public async await () {
		return this.get() ?? this.value as T | Promise<T>;
	}
}

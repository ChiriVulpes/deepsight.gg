import Bungie from "utility/bungie/Bungie";
import { EventManager } from "utility/EventManager";
import Time from "utility/Time";

interface ICachedModel<T> {
	cacheTime: number;
	value: T;
}

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

	public static clearCache () {
		console.warn("Clearing cache...");
		for (const key of Object.keys(localStorage)) {
			if (key.startsWith("modelCache/")) {
				console.info("Uncached", key);
				localStorage.removeItem(key);
			}
		}
	}

	public readonly event = new EventManager<this, IModelEvents<R>>(this);

	private get id () {
		return `modelCache/${this.name}`;
	}

	private value?: R | Promise<R>;

	public get loading () {
		return this.value === undefined || this.value instanceof Promise;
	}

	public constructor (private readonly name: string, private readonly model: IModel<T, R>) { }

	public reset () {
		const id = `modelCache/${this.name}`;
		localStorage.removeItem(id);
	}

	public get () {
		if (this.value === undefined) {
			this.event.emit("loading");

			const cachedString = localStorage.getItem(this.id);
			if (cachedString) {
				const cached = JSON.parse(cachedString) as ICachedModel<T>;

				const resetTime = this.model.resetTime;
				if (cached.cacheTime > (typeof resetTime === "number" ? Time.floor(resetTime) : Bungie[`last${resetTime}Reset`])) {
					// this cached value is valid
					console.info(`Using cached data for '${this.name}', cached at ${new Date(cached.cacheTime).toLocaleString()}`)
					this.value = (this.model.filter?.(cached.value) ?? cached.value) as R;
					this.event.emit("loaded", { value: this.value });
					return;
				}

				localStorage.removeItem(this.id);
			}

			const generated = this.model.generate();

			void generated.catch(error => {
				console.error(`Model '${this.name}' failed to load:`, error);
				this.event.emit("errored", { error: error as Error });
			});

			void generated.then(value => {
				this.value = (this.model.filter?.(value) ?? value) as R;
				const cached: ICachedModel<T> = { cacheTime: Date.now(), value };
				localStorage.setItem(this.id, JSON.stringify(cached));
				this.event.emit("loaded", { value: this.value });
			});

			this.value = generated.then(() => this.value!);

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

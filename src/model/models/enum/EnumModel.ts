import Model from "model/Model";
import type { DisplayPropertied } from "ui/bungie/DisplayProperties";
import type Arrays from "utility/Arrays";

export interface EnumModelDefinition<ALL, INDIVIDUAL extends DisplayPropertied> {
	generate (): Promise<ALL>;
	get (id?: Arrays.Or<string | number>): Promise<INDIVIDUAL | undefined>;
}

interface EnumModel<ALL, INDIVIDUAL extends DisplayPropertied> {
	get (id?: Arrays.Or<string | number>): Promise<INDIVIDUAL | undefined>;
}

class EnumModel<ALL, INDIVIDUAL extends DisplayPropertied> {

	public static create<DEF extends EnumModelDefinition<any, any>> (id: string, definition: DEF) {
		const model = new EnumModel(id, definition.generate);
		Object.assign(model, definition);
		return model as (DEF extends EnumModelDefinition<infer ALL, infer INDIVIDUAL> ? EnumModel<ALL, INDIVIDUAL> : never) & Omit<DEF, "generate">;
	}

	private readonly model: Model<ALL>;

	private constructor (public readonly id: string, generate: () => Promise<ALL>) {
		this.model = Model.create(id, {
			cache: "Memory",
			resetTime: "Daily",
			generate,
			reset: () => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				delete (this as any).all;
			},
		});
	}

	public get all (): ALL | Promise<ALL> {
		let promise: Promise<ALL>;
		// eslint-disable-next-line prefer-const
		promise = (async () => {
			const value = await this.model.await();

			if (this.all !== promise!)
				// reset happened
				return value;

			Object.defineProperty(this, "all", {
				value,
				configurable: true,
				writable: false,
			});

			return value;
		})();

		Object.defineProperty(this, "all", {
			value: promise,
			configurable: true,
		});

		return this.all;
	}
}

export default EnumModel;

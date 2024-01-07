import type { DisplayPropertied } from "ui/bungie/DisplayProperties";
import type Arrays from "utility/Arrays";

export interface EnumModelDefinitionObject extends DisplayPropertied {
	hash?: number;
	enumValue?: Arrays.Or<number>;
}

export type EnumModelAll<INDIVIDUAL extends EnumModelDefinitionObject> = Record<string, INDIVIDUAL> & {
	array: INDIVIDUAL[];
}

export type EnumModelIndividual<ALL> = Omit<ALL, "array"> extends Record<string, infer OBJECT extends EnumModelDefinitionObject> ? OBJECT : never;

export interface EnumModelDefinition<ALL> {
	generate (): Promise<ALL>;
	get?(id?: Arrays.Or<string | number>): EnumModelIndividual<ALL> | undefined;
}

class EnumModel<ALL extends EnumModelAll<INDIVIDUAL>, INDIVIDUAL extends EnumModelDefinitionObject> {

	private static promises?: Promise<any>[] = [];

	public static create<DEF extends EnumModelDefinition<any>> (id: string, definition: DEF) {
		const model = new EnumModel(id);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		const promise = definition.generate().then(all => (model as any).all = all);
		Object.assign(model, definition);
		EnumModel.promises?.push(promise);
		return model as any as (Omit<DEF, "generate">
			& (DEF extends EnumModelDefinition<infer ALL> ? EnumModelIndividual<ALL> extends infer INDIVIDUAL extends EnumModelDefinitionObject
				? EnumModel<Extract<Omit<ALL, "array">, Record<string, INDIVIDUAL>> & { array: INDIVIDUAL[] }, INDIVIDUAL> : never : never));
	}

	public static async awaitAll () {
		if (EnumModel.promises)
			await Promise.all(EnumModel.promises);
		delete EnumModel.promises;
	}

	public readonly all!: ALL;

	private constructor (public readonly id: string) { }

	public get (id?: Arrays.Or<string | number>) {
		if (!Array.isArray(id)) {
			const byHash = this.all.array.find(def => def.enumValue === +id! || def.hash === +id!);
			if (byHash)
				return byHash;

			const nameLowerCase = `${id!}`.toLowerCase();
			if (!nameLowerCase)
				// match none on zero length
				return undefined;

			const matching = this.all.array.filter(type => type.displayProperties.nameLowerCase!.startsWith(nameLowerCase));
			if (matching.length > 1)
				// return undefined on more than one match too
				return undefined;

			return matching[0];
		}

		id = id.map(hash => +hash);
		return this.all.array.find(def => !Array.isArray(def.enumValue) ? (id as number[]).includes(def.enumValue!)
			: def.enumValue.every(enumValue => (id as number[]).includes(enumValue)));
	}

	public nameOf (id?: Arrays.Or<string | number>) {
		const def = this.get(id);
		return Object.entries(this.all)
			.find(([, d]) => d === def)
			?.[0];
	}
}

export default EnumModel;

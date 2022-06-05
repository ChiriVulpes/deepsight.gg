import Model from "model/Model";
import GetGeneratedEnums, { DestinyGeneratedEnums } from "utility/d2ai/endpoint/GetGeneratedEnums";
import Time from "utility/Time";

export type IDestinyEnums = { [KEY in keyof DestinyGeneratedEnums]: DestinyEnums };

export class DestinyEnums {

	public static init (enums: DestinyGeneratedEnums) {
		return Object.fromEntries(Object.entries(enums)
			.map(([enumName, enumData]) => [enumName, new DestinyEnums(enumData as Record<string, number>)])) as IDestinyEnums;
	}

	private readonly _byName: Record<string, number>;
	private readonly _byHash: Record<number, string>;

	public constructor (byName: Record<string, number>) {
		this._byName = byName;
		this._byHash = Object.fromEntries(Object.entries(byName).map(([key, value]) => [value, key]));
	}

	public byName (name: string): number | undefined {
		return this._byName[name];
	}

	public byHash (hash: number): string | undefined {
		return this._byHash[hash];
	}
}

export default new Model("destiny-enums", {
	resetTime: Time.hours(1),
	generate: async () => await GetGeneratedEnums.query(),
	filter: (value) => DestinyEnums.init(value),
});

import type { DestinyGeneratedEnums } from "bungie-api-ts/generated-enums";
import Model from "model/Model";
import GetGeneratedEnums from "utility/endpoint/d2ai/endpoint/GetGeneratedEnums";
import Time from "utility/Time";

export type IDestinyEnums = { [KEY in keyof DestinyGeneratedEnums]: DestinyEnumHelper<DestinyGeneratedEnums[KEY]> };

export class DestinyEnumHelper<ENUM> {

	public static init (enums: DestinyGeneratedEnums) {
		return Object.fromEntries(Object.entries(enums)
			.map(([enumName, enumData]) => [enumName, new DestinyEnumHelper(enumData as Record<string, number>)])) as IDestinyEnums;
	}

	private readonly _byName: Record<keyof ENUM, number>;
	private readonly _byHash: Record<number, string>;

	public constructor (byName: Record<keyof ENUM, number>) {
		this._byName = byName;
		this._byHash = Object.fromEntries(Object.entries(byName).map(([key, value]) => [value as number, key]));
	}

	public byName (name: keyof ENUM): number {
		return this._byName[name];
	}

	public byHash (hash: number) {
		return this._byHash[hash] as keyof ENUM | undefined;
	}
}

export default Model.create("destiny-enums", {
	cache: "Session",
	resetTime: Time.hours(1),
	generate: async () => await GetGeneratedEnums.query(),
	filter: (value) => DestinyEnumHelper.init(value),
});

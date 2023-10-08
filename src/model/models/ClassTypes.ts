/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { DestinyClassDefinition } from "bungie-api-ts/destiny2";
import { DestinyClass } from "bungie-api-ts/destiny2";
import EnumModel from "model/models/EnumModel";
import Manifest from "model/models/Manifest";

export interface ClassTypesDefinition {
	array: DestinyClassDefinition[];
	titan: DestinyClassDefinition;
	hunter: DestinyClassDefinition;
	warlock: DestinyClassDefinition;
}

const ClassTypes = EnumModel.create("ClassTypes", {
	async generate (): Promise<ClassTypesDefinition> {
		const { DestinyClassDefinition } = await Manifest.await();
		const types = await DestinyClassDefinition.all();

		const result: ClassTypesDefinition = {
			array: types,
			titan: types.find(type => type.classType === DestinyClass.Titan)!,
			hunter: types.find(type => type.classType === DestinyClass.Hunter)!,
			warlock: types.find(type => type.classType === DestinyClass.Warlock)!,
		};

		(result.titan.displayProperties as any).icon = "https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_titan.svg";
		(result.hunter.displayProperties as any).icon = "https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_hunter.svg";
		(result.warlock.displayProperties as any).icon = "https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_warlock.svg";

		return result;
	},
	async get (this: EnumModel<ClassTypesDefinition, DestinyClassDefinition>, hash?: string | number) {
		const types = await this.all;
		return types.array.find(type => type.hash === +hash! || type.classType === +hash!);
	},
});

type ClassTypes = typeof ClassTypes;

export default ClassTypes;

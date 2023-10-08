import { DamageType, type DestinyDamageTypeDefinition } from "bungie-api-ts/destiny2";
import EnumModel from "model/models/EnumModel";
import Manifest from "model/models/Manifest";

export interface DamageTypesDefinition {
	array: DestinyDamageTypeDefinition[];
	none: DestinyDamageTypeDefinition;
	kinetic: DestinyDamageTypeDefinition;
	void: DestinyDamageTypeDefinition;
	solar: DestinyDamageTypeDefinition;
	arc: DestinyDamageTypeDefinition;
	stasis: DestinyDamageTypeDefinition;
	strand: DestinyDamageTypeDefinition;
	raid: DestinyDamageTypeDefinition;
}

const DamageTypes = EnumModel.create("DamageTypes", {
	async generate (): Promise<DamageTypesDefinition> {
		const { DestinyDamageTypeDefinition } = await Manifest.await();
		const types = await DestinyDamageTypeDefinition.all();

		return {
			array: types,
			none: types.find(type => type.enumValue === DamageType.None)!,
			kinetic: types.find(type => type.enumValue === DamageType.Kinetic)!,
			void: types.find(type => type.enumValue === DamageType.Void)!,
			solar: types.find(type => type.enumValue === DamageType.Thermal)!,
			arc: types.find(type => type.enumValue === DamageType.Arc)!,
			stasis: types.find(type => type.enumValue === DamageType.Stasis)!,
			strand: types.find(type => type.enumValue === DamageType.Strand)!,
			raid: types.find(type => type.enumValue === DamageType.Raid)!,
		}
	},
	async get (this: EnumModel<DamageTypesDefinition, DestinyDamageTypeDefinition>, hash?: string | number) {
		const types = await this.all;
		return types.array.find(type => type.hash === +hash! || type.enumValue === +hash!);
	},
});

type DamageTypes = typeof DamageTypes;

export default DamageTypes;

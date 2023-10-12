import type { DestinyDisplayPropertiesDefinition } from "bungie-api-ts/destiny2";
import { DestinyAmmunitionType } from "bungie-api-ts/destiny2";
import EnumModel from "model/models/enum/EnumModel";

export interface DestinyAmmunitionTypeDefinition {
	enumValue: DestinyAmmunitionType;
	displayProperties: DestinyDisplayPropertiesDefinition;
}

export interface AmmoTypesDefinition {
	array: DestinyAmmunitionTypeDefinition[];
	primary: DestinyAmmunitionTypeDefinition;
	special: DestinyAmmunitionTypeDefinition;
	heavy: DestinyAmmunitionTypeDefinition;
}

const AmmoTypes = EnumModel.create("AmmoTypes", {
	// eslint-disable-next-line @typescript-eslint/require-await
	async generate (): Promise<AmmoTypesDefinition> {
		const emptyDisplayProperties: DestinyDisplayPropertiesDefinition = {
			name: "",
			description: "",
			icon: "",
			iconSequences: [],
			highResIcon: "",
			hasIcon: false,
		};

		const types: DestinyAmmunitionTypeDefinition[] = [
			{
				enumValue: DestinyAmmunitionType.None,
				displayProperties: { ...emptyDisplayProperties },
			},
			{
				enumValue: DestinyAmmunitionType.Unknown,
				displayProperties: { ...emptyDisplayProperties, name: "Unknown" },
			},
			{
				enumValue: DestinyAmmunitionType.Primary,
				displayProperties: { ...emptyDisplayProperties, name: "Primary", icon: "/img/destiny_content/ammo_types/primary.png" },
			},
			{
				enumValue: DestinyAmmunitionType.Special,
				displayProperties: { ...emptyDisplayProperties, name: "Special", icon: "/img/destiny_content/ammo_types/special.png" },
			},
			{
				enumValue: DestinyAmmunitionType.Heavy,
				displayProperties: { ...emptyDisplayProperties, name: "Heavy", icon: "/img/destiny_content/ammo_types/heavy.png" },
			},
		];

		return {
			array: types,
			primary: types.find(type => type.enumValue === DestinyAmmunitionType.Primary)!,
			special: types.find(type => type.enumValue === DestinyAmmunitionType.Special)!,
			heavy: types.find(type => type.enumValue === DestinyAmmunitionType.Heavy)!,
		}
	},
	async get (this: EnumModel<AmmoTypesDefinition, DestinyAmmunitionTypeDefinition>, hash?: string | number) {
		const types = await this.all;
		return types.array.find(type => type.enumValue === +hash!);
	},
});

type AmmoTypes = typeof AmmoTypes;

export default AmmoTypes;

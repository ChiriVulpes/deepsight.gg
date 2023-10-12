import type { DestinyDisplayPropertiesDefinition } from "bungie-api-ts/destiny2";
import { ItemCategoryHashes } from "bungie-api-ts/destiny2";
import EnumModel from "model/models/enum/EnumModel";
import type Arrays from "utility/Arrays";

export interface DestinyWeaponTypeDefinition {
	enumValue: Arrays.Or<ItemCategoryHashes>;
	displayProperties: DestinyDisplayPropertiesDefinition;
}

export interface WeaponTypesDefinition {
	array: DestinyWeaponTypeDefinition[];
	autoRifle: DestinyWeaponTypeDefinition;
	shotgun: DestinyWeaponTypeDefinition;
	machineGun: DestinyWeaponTypeDefinition;
	handCannon: DestinyWeaponTypeDefinition;
	rocketLauncher: DestinyWeaponTypeDefinition;
	fusionRifle: DestinyWeaponTypeDefinition;
	sniperRifle: DestinyWeaponTypeDefinition;
	pulseRifle: DestinyWeaponTypeDefinition;
	scoutRifle: DestinyWeaponTypeDefinition;
	sidearm: DestinyWeaponTypeDefinition;
	sword: DestinyWeaponTypeDefinition;
	linearFusionRifle: DestinyWeaponTypeDefinition;
	grenadeLauncher: DestinyWeaponTypeDefinition;
	heavyGrenadeLauncher: DestinyWeaponTypeDefinition;
	submachineGun: DestinyWeaponTypeDefinition;
	traceRifle: DestinyWeaponTypeDefinition;
	bow: DestinyWeaponTypeDefinition;
	glaive: DestinyWeaponTypeDefinition;
}

const WeaponTypes = EnumModel.create("WeaponTypes", {
	// eslint-disable-next-line @typescript-eslint/require-await
	async generate (): Promise<WeaponTypesDefinition> {
		const emptyDisplayProperties: DestinyDisplayPropertiesDefinition = {
			name: "",
			description: "",
			icon: "",
			iconSequences: [],
			highResIcon: "",
			hasIcon: false,
		};

		const types: DestinyWeaponTypeDefinition[] = [
			{
				enumValue: ItemCategoryHashes.AutoRifle,
				displayProperties: { ...emptyDisplayProperties, name: "Auto Rifle", icon: "image/svg/weapon/auto_rifle.svg" },
			},
			{
				enumValue: ItemCategoryHashes.Shotgun,
				displayProperties: { ...emptyDisplayProperties, name: "Shotgun", icon: "image/svg/weapon/shotgun.svg" },
			},
			{
				enumValue: ItemCategoryHashes.MachineGun,
				displayProperties: { ...emptyDisplayProperties, name: "Machine Gun", icon: "image/svg/weapon/machine_gun.svg" },
			},
			{
				enumValue: ItemCategoryHashes.HandCannon,
				displayProperties: { ...emptyDisplayProperties, name: "Hand Cannon", icon: "image/svg/weapon/hand_cannon.svg" },
			},
			{
				enumValue: ItemCategoryHashes.RocketLauncher,
				displayProperties: { ...emptyDisplayProperties, name: "Rocket Launcher", icon: "image/svg/weapon/rocket_launcher.svg" },
			},
			{
				enumValue: ItemCategoryHashes.FusionRifle,
				displayProperties: { ...emptyDisplayProperties, name: "Fusion Rifle", icon: "image/svg/weapon/fusion_rifle.svg" },
			},
			{
				enumValue: ItemCategoryHashes.SniperRifle,
				displayProperties: { ...emptyDisplayProperties, name: "Sniper Rifle", icon: "image/svg/weapon/sniper_rifle.svg" },
			},
			{
				enumValue: ItemCategoryHashes.PulseRifle,
				displayProperties: { ...emptyDisplayProperties, name: "Pulse Rifle", icon: "image/svg/weapon/pulse_rifle.svg" },
			},
			{
				enumValue: ItemCategoryHashes.ScoutRifle,
				displayProperties: { ...emptyDisplayProperties, name: "Scout Rifle", icon: "image/svg/weapon/scout_rifle.svg" },
			},
			{
				enumValue: ItemCategoryHashes.Sidearm,
				displayProperties: { ...emptyDisplayProperties, name: "Sidearm", icon: "image/svg/weapon/sidearm.svg" },
			},
			{
				enumValue: ItemCategoryHashes.Sword,
				displayProperties: { ...emptyDisplayProperties, name: "Sword", icon: "image/svg/weapon/sword.svg" },
			},
			{
				enumValue: ItemCategoryHashes.LinearFusionRifles,
				displayProperties: { ...emptyDisplayProperties, name: "Linear Fusion Rifle", icon: "image/svg/weapon/linear_fusion_rifle.svg" },
			},
			{
				enumValue: [ItemCategoryHashes.GrenadeLaunchers, ItemCategoryHashes.PowerWeapon],
				displayProperties: { ...emptyDisplayProperties, name: "Heavy Grenade Launcher", icon: "image/svg/weapon/grenade_launcher_heavy.svg" },
			},
			{
				enumValue: ItemCategoryHashes.GrenadeLaunchers,
				displayProperties: { ...emptyDisplayProperties, name: "Grenade Launcher", icon: "image/svg/weapon/grenade_launcher.svg" },
			},
			{
				enumValue: ItemCategoryHashes.SubmachineGuns,
				displayProperties: { ...emptyDisplayProperties, name: "Submachine Gun", icon: "image/svg/weapon/submachine_gun.svg" },
			},
			{
				enumValue: ItemCategoryHashes.TraceRifles,
				displayProperties: { ...emptyDisplayProperties, name: "Trace Rifle", icon: "image/svg/weapon/trace_rifle.svg" },
			},
			{
				enumValue: ItemCategoryHashes.Bows,
				displayProperties: { ...emptyDisplayProperties, name: "Combat Bow", icon: "image/svg/weapon/combat_bow.svg" },
			},
			{
				enumValue: ItemCategoryHashes.Glaives,
				displayProperties: { ...emptyDisplayProperties, name: "Glaive", icon: "image/svg/weapon/glaive.svg" },
			},
		];

		for (const type of types)
			type.displayProperties.nameLowerCase = type.displayProperties.name.toLowerCase();

		return {
			array: types,
			autoRifle: types.find(type => type.enumValue === ItemCategoryHashes.AutoRifle)!,
			shotgun: types.find(type => type.enumValue === ItemCategoryHashes.Shotgun)!,
			machineGun: types.find(type => type.enumValue === ItemCategoryHashes.MachineGun)!,
			handCannon: types.find(type => type.enumValue === ItemCategoryHashes.HandCannon)!,
			rocketLauncher: types.find(type => type.enumValue === ItemCategoryHashes.RocketLauncher)!,
			fusionRifle: types.find(type => type.enumValue === ItemCategoryHashes.FusionRifle)!,
			sniperRifle: types.find(type => type.enumValue === ItemCategoryHashes.SniperRifle)!,
			pulseRifle: types.find(type => type.enumValue === ItemCategoryHashes.PulseRifle)!,
			scoutRifle: types.find(type => type.enumValue === ItemCategoryHashes.ScoutRifle)!,
			sidearm: types.find(type => type.enumValue === ItemCategoryHashes.Sidearm)!,
			sword: types.find(type => type.enumValue === ItemCategoryHashes.Sword)!,
			linearFusionRifle: types.find(type => type.enumValue === ItemCategoryHashes.LinearFusionRifles)!,
			grenadeLauncher: types.find(type => type.enumValue === ItemCategoryHashes.GrenadeLaunchers)!,
			heavyGrenadeLauncher: types.find(type => Array.isArray(type.enumValue) && type.enumValue.includes(ItemCategoryHashes.GrenadeLaunchers) && type.enumValue.includes(ItemCategoryHashes.PowerWeapon))!,
			submachineGun: types.find(type => type.enumValue === ItemCategoryHashes.SubmachineGuns)!,
			traceRifle: types.find(type => type.enumValue === ItemCategoryHashes.TraceRifles)!,
			bow: types.find(type => type.enumValue === ItemCategoryHashes.Bows)!,
			glaive: types.find(type => type.enumValue === ItemCategoryHashes.Glaives)!,
		}
	},
	async get (this: EnumModel<WeaponTypesDefinition, DestinyWeaponTypeDefinition>, hash?: Arrays.Or<string | number>) {
		const types = await this.all;
		if (!Array.isArray(hash)) {
			const byHash = types.array.find(def => def.enumValue === +hash!);
			if (byHash)
				return byHash;

			const nameLowerCase = `${hash!}`.toLowerCase();
			if (!nameLowerCase)
				// match none on zero length
				return undefined;

			const matching = types.array.filter(type => type.displayProperties.nameLowerCase!.startsWith(nameLowerCase));
			if (matching.length > 1)
				// return undefined on more than one match too
				return undefined;

			return matching[0];
		}

		hash = hash.map(hash => +hash);
		return types.array.find(def => !Array.isArray(def.enumValue) ? (hash as number[]).includes(def.enumValue)
			: def.enumValue.every(enumValue => (hash as number[]).includes(enumValue)));
	},
});

type WeaponTypes = typeof WeaponTypes;

export default WeaponTypes;

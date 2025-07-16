import { StatHashes } from "@deepsight.gg/enums";
import type { DestinyStatDefinition } from "bungie-api-ts/destiny2";
import EnumModel from "model/models/enum/EnumModel";
import Manifest from "model/models/Manifest";

export interface StatTypesDefinition {
	array: DestinyStatDefinition[];
	weapons: DestinyStatDefinition;
	health: DestinyStatDefinition;
	class: DestinyStatDefinition;
	grenade: DestinyStatDefinition;
	super: DestinyStatDefinition;
	melee: DestinyStatDefinition;
}

/**
 * For display properties of stats that have iconography
 */
const StatTypes = EnumModel.create("StatTypes", {
	async generate (): Promise<StatTypesDefinition> {
		const { DestinyStatDefinition } = await Manifest.await();
		const types = await DestinyStatDefinition.all();

		const health = types.find(type => type.hash === StatHashes.Health)!;
		const melee = types.find(type => type.hash === StatHashes.Melee4244567218)!;
		const grenade = types.find(type => type.hash === StatHashes.Grenade)!;
		const superStat = types.find(type => type.hash === StatHashes.Super)!;
		const classStat = types.find(type => type.hash === StatHashes.Class1943323491)!;
		const weapons = types.find(type => type.hash === StatHashes.Weapons)!;

		const array = [health, melee, grenade, superStat, classStat, weapons];

		for (const def of array) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			(def.displayProperties as any).icon = `https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/${def.displayProperties.name.toLowerCase()}.svg`;
		}

		return {
			array,
			health,
			melee,
			grenade,
			super: superStat,
			class: classStat,
			weapons,
		};
	},
});

type StatTypes = typeof StatTypes;

export default StatTypes;

import type { DestinyStatDefinition } from "bungie-api-ts/destiny2";
import { StatHashes } from "bungie-api-ts/destiny2";
import EnumModel from "model/models/enum/EnumModel";
import Manifest from "model/models/manifest/DestinyManifest";

export interface StatTypesDefinition {
	array: DestinyStatDefinition[];
	mobility: DestinyStatDefinition;
	resilience: DestinyStatDefinition;
	recovery: DestinyStatDefinition;
	discipline: DestinyStatDefinition;
	intellect: DestinyStatDefinition;
	strength: DestinyStatDefinition;
}

/**
 * For display properties of stats that have iconography
 */
const StatTypes = EnumModel.create("StatTypes", {
	async generate (): Promise<StatTypesDefinition> {
		const { DestinyStatDefinition } = await Manifest.await();
		const types = await DestinyStatDefinition.all();

		const mobility = types.find(type => type.hash === StatHashes.Mobility)!;
		const resilience = types.find(type => type.hash === StatHashes.Resilience)!;
		const recovery = types.find(type => type.hash === StatHashes.Recovery)!;
		const discipline = types.find(type => type.hash === StatHashes.Discipline)!;
		const intellect = types.find(type => type.hash === StatHashes.Intellect)!;
		const strength = types.find(type => type.hash === StatHashes.Strength)!;

		const array = [mobility, resilience, recovery, discipline, intellect, strength];

		for (const def of array) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			(def.displayProperties as any).icon = `https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/${def.displayProperties.name.toLowerCase()}.svg`;
		}

		return {
			array,
			mobility,
			resilience,
			recovery,
			discipline,
			intellect,
			strength,
		}
	},
	async get (this: EnumModel<StatTypesDefinition, DestinyStatDefinition>, hash?: string | number) {
		const types = await this.all;
		return types.array.find(type => type.hash === +hash!);
	},
});

type StatTypes = typeof StatTypes;

export default StatTypes;

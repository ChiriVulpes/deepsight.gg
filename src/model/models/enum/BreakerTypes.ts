import { DestinyBreakerType, type DestinyBreakerTypeDefinition } from "bungie-api-ts/destiny2";
import EnumModel from "model/models/enum/EnumModel";
import Manifest from "model/models/Manifest";

export interface BreakerTypesDefinition {
	array: DestinyBreakerTypeDefinition[];
	barrier: DestinyBreakerTypeDefinition;
	overload: DestinyBreakerTypeDefinition;
	unstoppable: DestinyBreakerTypeDefinition;
}

const BreakerTypes = EnumModel.create("BreakerTypes", {
	async generate (): Promise<BreakerTypesDefinition> {
		const { DestinyBreakerTypeDefinition } = await Manifest.await();
		const types = await DestinyBreakerTypeDefinition.all();

		return {
			array: types,
			barrier: types.find(type => type.enumValue === DestinyBreakerType.ShieldPiercing)!,
			overload: types.find(type => type.enumValue === DestinyBreakerType.Disruption)!,
			unstoppable: types.find(type => type.enumValue === DestinyBreakerType.Stagger)!,
		};
	},
});

type BreakerTypes = typeof BreakerTypes;

export default BreakerTypes;

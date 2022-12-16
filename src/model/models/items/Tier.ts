import type { IItemInit } from "model/models/items/Item";
import type Manifest from "model/models/Manifest";

export enum TierHashes {
	// I don't know why there's three of these
	Basic1 = 1801258597,
	Basic2 = 3340296461,
	Basic3 = 3772930460,

	Common = 2395677314,
	Rare = 2127292149,
	Legendary = 4008398120,
	Exotic = 2759499571,
}

namespace Tier {

	export async function apply ({ DestinyItemTierTypeDefinition }: Manifest, item: IItemInit) {
		item.tier = await DestinyItemTierTypeDefinition.get(item.definition.inventory?.tierTypeHash);
	}
}

export default Tier;

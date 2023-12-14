import type Manifest from "model/models/Manifest";
import type { IItemInit } from "model/models/items/Item";

namespace Tier {

	export async function apply ({ DeepsightTierTypeDefinition }: Manifest, item: IItemInit) {
		item.tier = await DeepsightTierTypeDefinition.get(item.definition.inventory?.tierTypeHash);
	}
}

export default Tier;

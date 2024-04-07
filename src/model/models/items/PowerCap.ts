import type Manifest from "model/models/Manifest";
import type { IItemInit } from "model/models/items/Item";

namespace PowerCap {

	export async function apply ({ DestinyPowerCapDefinition }: Manifest, item: IItemInit) {
		item.powerCap = await DestinyPowerCapDefinition.get(item?.definition.quality?.versions[item.definition.quality.currentVersion]?.powerCapHash);
	}
}

export default PowerCap;

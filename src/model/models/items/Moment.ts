import { DestinyItemType } from "bungie-api-ts/destiny2";
import type Manifest from "model/models/Manifest";
import type { IItemInit } from "model/models/items/Item";

namespace Moment {

	export async function apply (manifest: Manifest, item: IItemInit) {
		item.moment = await resolve(manifest, item);
	}

	async function resolve ({ DeepsightMomentDefinition }: Manifest, item: IItemInit) {
		if (!item.definition.iconWatermark)
			return undefined;

		// skip engrams
		if (item.definition.itemType === DestinyItemType.Engram || item.definition.traitHashes?.includes(1465704995))
			return undefined;

		const moment = await DeepsightMomentDefinition.get("iconWatermark", item.definition.iconWatermark);
		if (moment)
			return moment;

		console.warn(`Unable to determine moment of '${item.definition.displayProperties.name}' (${item.definition.hash})`, item);
		return undefined;
	}
}

export default Moment;

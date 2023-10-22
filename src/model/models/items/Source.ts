import { DestinyItemType } from "bungie-api-ts/destiny2";
import type Manifest from "model/models/Manifest";
import type { IItemInit } from "model/models/items/Item";

namespace Source {

	export async function apply (manifest: Manifest, item: IItemInit) {
		item.source = await resolve(manifest, item);
	}

	async function resolve ({ DeepsightSourceDefinition }: Manifest, item: IItemInit) {
		if (!item.definition.iconWatermark)
			return undefined;

		// skip engrams
		if (item.definition.itemType === DestinyItemType.Engram || item.definition.traitHashes?.includes(1465704995))
			return undefined;

		const source = await DeepsightSourceDefinition.get("iconWatermark", item.definition.iconWatermark);
		if (source)
			return source;

		console.warn(`Unable to determine source of '${item.definition.displayProperties.name}' (${item.definition.hash})`, item);
		return undefined;
	}
}

export default Source;

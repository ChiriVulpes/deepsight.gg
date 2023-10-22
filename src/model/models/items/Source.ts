import { DestinyItemType } from "bungie-api-ts/destiny2";
import type { IItemInit } from "model/models/items/Item";
import type Manifest from "model/models/manifest/DestinyManifest";

namespace Source {

	export async function apply (manifest: Manifest, item: IItemInit) {
		item.source = await resolve(manifest, item);
	}

	async function resolve ({ DestinySourceDefinition }: Manifest, item: IItemInit) {
		if (!item.definition.iconWatermark)
			return undefined;

		// skip engrams
		if (item.definition.itemType === DestinyItemType.Engram || item.definition.traitHashes?.includes(1465704995))
			return undefined;

		const source = await DestinySourceDefinition.get("iconWatermark", item.definition.iconWatermark);
		if (source)
			return source;

		console.warn(`Unable to determine source of '${item.definition.displayProperties.name}' (${item.definition.hash})`, item);
		return undefined;
	}
}

export default Source;

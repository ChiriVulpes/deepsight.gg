import type { IItemInit } from "model/models/items/Item";
import type { Manifest } from "model/models/Manifest";

namespace Source {

	export async function apply (manifest: Manifest, item: IItemInit) {
		item.source = await resolve(manifest, item);
	}

	async function resolve ({ DestinySourceDefinition }: Manifest, item: IItemInit) {
		let source = await DestinySourceDefinition.get("iconWatermark", `https://www.bungie.net${item.definition.iconWatermark}`);
		if (source)
			return source;

		source = await DestinySourceDefinition.get("id", "redwar");
		if (source?.itemHashes?.includes(item.definition.hash))
			return source;

		console.warn(`Unable to determine source of '${item.definition.displayProperties.name}' (${item.definition.hash})`, item);
		return undefined;
	}
}

export default Source;
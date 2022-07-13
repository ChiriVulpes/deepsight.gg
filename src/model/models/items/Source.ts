import type Item from "model/models/items/Item";
import type { Manifest } from "model/models/Manifest";

namespace Source {

	export async function resolve ({ DestinySourceDefinition }: Manifest, item: Item) {
		let source = await DestinySourceDefinition.get("iconWatermark", `https://www.bungie.net${item.definition.iconWatermark}`);
		if (source)
			return source;

		source = await DestinySourceDefinition.get("id", "redwar");
		if (source?.itemHashes?.includes(item.definition.hash))
			return source;

		source = undefined;
		console.warn(`Unable to determine source of '${item.definition.displayProperties.name}' (${item.definition.hash})`, item);
	}
}

export default Source;

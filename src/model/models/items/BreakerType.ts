import type { DestinyBreakerTypeDefinition } from "bungie-api-ts/destiny2";
import type { BreakerTypeHashes, InventoryItemHashes } from "deepsight.gg/Enums";
import type Manifest from "model/models/Manifest";
import BreakerTypes from "model/models/enum/BreakerTypes";
import type Item from "model/models/items/Item";

namespace BreakerType {

	export async function apply (manifest: Manifest, item: Item) {
		item.breakerTypes = await getBreakerTypes(manifest, item)
			.then(types => types.map(type => BreakerTypes.get(type))
				.filter((type): type is DestinyBreakerTypeDefinition => !!type));
	}

	async function getBreakerTypes (manifest: Manifest, item: Item) {
		const { DeepsightBreakerTypeDefinition } = manifest;
		const breakerTypes = await Promise.resolve(DeepsightBreakerTypeDefinition.all())
			.then(types => types.toObject(type => [type.hash, type]));

		const traitSockets = item.getSockets("Perk/Trait", "Intrinsic/Exotic");
		const plugs = !item.bucket.isCollections() ? traitSockets.flatMap(socket => socket.plugs)
			: (await Promise.all(traitSockets.map(socket => socket.getPool()))).flat();

		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		return plugs
			.flatMap((plug): (BreakerTypeHashes | undefined)[] => breakerTypes[plug?.definition?.hash as InventoryItemHashes]?.types ?? [])
			.concat(breakerTypes[item.definition.hash as InventoryItemHashes]?.types)
			.distinct()
			.filter(type => type !== undefined);
	}
}

export default BreakerType;

import type { DestinyBreakerTypeDefinition } from "bungie-api-ts/destiny2";
import { DestinyBreakerType } from "bungie-api-ts/destiny2";
import { InventoryItemHashes } from "deepsight.gg/Enums";
import BreakerTypes from "model/models/enum/BreakerTypes";
import type Item from "model/models/items/Item";

namespace BreakerType {

	export async function apply (item: Item) {
		item.breakerTypes = await getBreakerTypes(item)
			.then(types => types.map(type => BreakerTypes.get(type))
				.filter((type): type is DestinyBreakerTypeDefinition => !!type));
	}

	const breakerPerks: Record<number, DestinyBreakerType[]> = {
		[InventoryItemHashes.ChillClipTraitPlug]: [DestinyBreakerType.Disruption, DestinyBreakerType.Stagger],
		[InventoryItemHashes.ChillClipEnhancedTraitPlug]: [DestinyBreakerType.Disruption, DestinyBreakerType.Stagger],
		[InventoryItemHashes.VoltshotTraitPlug]: [DestinyBreakerType.Disruption],
		[InventoryItemHashes.VoltshotEnhancedTraitPlug]: [DestinyBreakerType.Disruption],
	};

	const breakerItems: Record<number, DestinyBreakerType[]> = {
		[InventoryItemHashes.SecantFilamentsLegArmor]: [DestinyBreakerType.Disruption],
		[InventoryItemHashes.SecondChanceGauntlets]: [DestinyBreakerType.ShieldPiercing],
		[InventoryItemHashes.AthryssEmbraceGauntlets]: [DestinyBreakerType.Stagger],
	};

	async function getBreakerTypes (item: Item) {
		const traitSockets = item.getSockets("Perk/Trait");
		const plugs = !item.bucket.isCollections() ? traitSockets.flatMap(socket => socket.plugs)
			: (await Promise.all(traitSockets.map(socket => socket.getPool()))).flat();

		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		return plugs.flatMap(plug => breakerPerks[plug?.definition?.hash!] ?? [])
			.concat(item.definition.breakerType, breakerItems[item.definition.hash] ?? [])
			.distinct()
			.filter(type => type !== DestinyBreakerType.None);
	}
}

export default BreakerType;

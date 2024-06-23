import { ItemTierTypeHashes } from "@deepsight.gg/enums";

namespace Rarities {
	export const COLOURS = {
		[ItemTierTypeHashes.Invalid]: 0,
		[ItemTierTypeHashes.BasicCurrency]: 0xdddddd,
		[ItemTierTypeHashes.BasicQuest]: 0xdddddd,
		[ItemTierTypeHashes.Common]: 0xdddddd,
		[ItemTierTypeHashes.Uncommon]: 0x5fa16d,
		[ItemTierTypeHashes.Rare]: 0x7eaadf,
		[ItemTierTypeHashes.Legendary]: 0x774493,
		[ItemTierTypeHashes.Exotic]: 0xf5dc56,
	};

	export function getColour (tier?: ItemTierTypeHashes): `#${string}` | undefined {
		return COLOURS[tier!]
			?.toString(16)
			.padStart(6, "0")
			.padStart(7, "#") as `#${string}`;
	}
}

export default Rarities;

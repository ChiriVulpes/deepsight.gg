import type { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { ItemCategoryHashes } from "bungie-api-ts/destiny2";
import Manifest from "model/models/Manifest";
import Arrays from "utility/Arrays";

namespace ItemEquippableDummies {

	export async function findPreferredCopy (item: string | number | DestinyInventoryItemDefinition) {
		const { DestinyInventoryItemDefinition } = await Manifest.await();
		if (typeof item !== "string") {
			const definition = typeof item === "object" ? item : await DestinyInventoryItemDefinition.get(item);
			if (!definition?.displayProperties.name)
				return undefined;

			item = definition.displayProperties.name;
		}

		const matching = await DestinyInventoryItemDefinition.all("name", item);

		const [preferred] = ((await Promise.all(matching.filter(item => !is(item))
			.map(async item => Arrays.tuple(item, await getPreferredCopySortIndex(item)))))
			.sort(([, a], [, b]) => b - a))
			.map(([item]) => item);

		return preferred;
	}

	export function is (item: DestinyInventoryItemDefinition) {
		return !item.equippable
			|| item.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies)
			|| !(item.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) || item.itemCategoryHashes?.includes(ItemCategoryHashes.Armor));
	}

	export async function getPreferredCopySortIndex (item: DestinyInventoryItemDefinition) {
		const { DestinyPowerCapDefinition } = await Manifest.await();
		const powerCap = await DestinyPowerCapDefinition.get(item.quality?.versions[item.quality.currentVersion]?.powerCapHash);

		return (item.collectibleHash ? 100000 : 0)
			+ (item.plug ? 0 : 10000)
			+ ((powerCap?.powerCap ?? 0) < 900000 ? 0 : 1000);
	}
}

export default ItemEquippableDummies;



import type { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { ItemCategoryHashes } from "../Enums";
import manifest from "./endpoint/DestinyManifest";

namespace ItemEquippableDummies {

	export async function findPreferredCopy (item: string | number | DestinyInventoryItemDefinition) {
		const { DestinyInventoryItemDefinition } = manifest;
		if (typeof item !== "string") {
			const definition = typeof item === "object" ? item : await DestinyInventoryItemDefinition.get(item);
			if (!definition?.displayProperties.name)
				return undefined;

			item = definition.displayProperties.name;
		}

		const name = item;
		const items = await DestinyInventoryItemDefinition.all();
		const matching = Object.values(items).filter(item => item.displayProperties?.name === name);

		const [preferred] = ((await Promise.all(matching.filter(item => !is(item))
			.map(async item => [item, await getPreferredCopySortIndex(item)] as const)))
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
		const { DestinyPowerCapDefinition } = manifest;
		const powerCap = await DestinyPowerCapDefinition.get(item.quality?.versions[item.quality.currentVersion]?.powerCapHash);

		return (item.collectibleHash ? 100000 : 0)
			+ (item.plug ? 0 : 10000)
			+ ((powerCap?.powerCap ?? 0) < 900000 ? 0 : 1000);
	}
}

export default ItemEquippableDummies;

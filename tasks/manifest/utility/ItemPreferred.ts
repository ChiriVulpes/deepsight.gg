
import { InventoryItemHashes, ItemCategoryHashes } from "@deepsight.gg/enums";
import type { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import manifest from "./endpoint/DestinyManifest";

namespace ItemPreferred {

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

		const [preferred] = ((await Promise.all(matching.filter(item => !isEquippableDummy(item))
			.map(async item => [item, await getPreferredCopySortIndex(item)] as const)))
			.sort(([, a], [, b]) => b - a))
			.map(([item]) => item);

		return preferred;
	}

	export function isEquippableDummy (item: DestinyInventoryItemDefinition) {
		return !item.equippable
			|| item.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies)
			|| !(item.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) || item.itemCategoryHashes?.includes(ItemCategoryHashes.Armor));
	}

	const IGNORED_ITEMS = [
		InventoryItemHashes.BraytechWerewolfAutoRifle_QualityVersionsLength2, // older
		InventoryItemHashes.CompassRoseShotgun233896077, // has less links to other things in the manifest
		InventoryItemHashes.TaraxipposScoutRifle3007479950, // displays weirdly in the screenshot
	];

	export async function getPreferredCopySortIndex (item: DestinyInventoryItemDefinition) {
		const { DestinyPowerCapDefinition } = manifest;
		const powerCap = await DestinyPowerCapDefinition.get(item.quality?.versions[item.quality.currentVersion]?.powerCapHash);

		return 0
			+ (IGNORED_ITEMS.includes(item.hash) ? 0 : 1_000_000)
			+ (item.collectibleHash ? 100_000 : 0)
			+ (item.plug ? 0 : 10_000)
			+ ((powerCap?.powerCap ?? 0) < 900_000 ? 0 : 1_000)
			+ (item.sockets?.socketEntries.some(socket => socket.singleInitialItemHash === InventoryItemHashes.EmptyDeepsightSocketPlug) ? 100 : 0);
	}
}

export default ItemPreferred;

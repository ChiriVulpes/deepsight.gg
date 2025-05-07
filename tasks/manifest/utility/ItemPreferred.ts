
import { InventoryItemHashes, ItemCategoryHashes } from "@deepsight.gg/enums";
import type { DestinyInventoryItemDefinition, DestinyPowerCapDefinition } from "bungie-api-ts/destiny2";
import manifest from "./endpoint/DestinyManifest";

namespace ItemPreferred {

	export async function findPreferredCopy (item: string | number | DestinyInventoryItemDefinition) {
		const { DestinyInventoryItemDefinition, DestinyPowerCapDefinition } = manifest;
		const items = await DestinyInventoryItemDefinition.all();
		const powerCaps = await DestinyPowerCapDefinition.all();

		if (typeof item !== "string") {
			const definition = typeof item === "object" ? item : items[item];
			if (!definition?.displayProperties.name)
				return undefined;

			item = definition.displayProperties.name;
		}

		const name = item;
		const matching = Object.values(items).filter(item => item.displayProperties?.name === name);

		const [preferred] = matching.filter(item => !isEquippableDummy(item))
			.sort((a, b) => sortPreferredCopy(a, b, powerCaps));

		return preferred;
	}

	export function isEquippableDummy (item: DestinyInventoryItemDefinition) {
		return !item.equippable
			|| item.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies)
			|| !(item.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) || item.itemCategoryHashes?.includes(ItemCategoryHashes.Armor));
	}

	const IGNORED_ITEMS = [
		InventoryItemHashes.BraytechWerewolfAutoRifle528834068, // older
		InventoryItemHashes.BraytechWerewolfAutoRifle2869466318, // older
		InventoryItemHashes.CompassRoseShotgun233896077, // has less links to other things in the manifest
		InventoryItemHashes.CompassRoseShotgun2591111628, // older
		InventoryItemHashes.TaraxipposScoutRifle3007479950, // displays weirdly in the screenshot
		InventoryItemHashes.TheTitleSubmachineGun294129361, // older
		InventoryItemHashes.BondOfTheGreatHuntWarlockBond2280287728, // has less links to other things in the manifest, displays weirdly in the screenshot
		InventoryItemHashes.GauntletsOfTheGreatHuntGauntlets576683388, // has less links to other things in the manifest
		InventoryItemHashes.GripsOfTheGreatHuntGauntlets1127835600, // has less links to other things in the manifest
		InventoryItemHashes.MarkOfTheGreatHuntTitanMark16387641, // has less links to other things in the manifest
		InventoryItemHashes.RobesOfTheGreatHuntChestArmor776723133, // has less links to other things in the manifest
		InventoryItemHashes.CrowningDuologueRocketLauncher_SecondaryIconUndefined, // older
		InventoryItemHashes.SomethingNewHandCannon1856262127, // older
		InventoryItemHashes.JurassicGreenPulseRifle2261046232, // older
		InventoryItemHashes.JurassicGreenPulseRifle2603335652, // older
		InventoryItemHashes.MechabreSniperRifle1280894514, // older
		InventoryItemHashes.ZephyrSword396910433, // older
		InventoryItemHashes.AvalancheMachineGun495940989, // older
		InventoryItemHashes.HullabalooGrenadeLauncher657927352, // older
		InventoryItemHashes.TaraxipposScoutRifle1389546626, // older
		InventoryItemHashes.TheTitleSubmachineGun655712834, // older
	];

	export function isIgnored (item: InventoryItemHashes) {
		return IGNORED_ITEMS.includes(item);
	}

	const hasDeepsightSocket = (item: DestinyInventoryItemDefinition) =>
		!!item.sockets?.socketEntries.some(socket => socket.singleInitialItemHash === InventoryItemHashes.EmptyDeepsightSocketPlug);

	export function sortPreferredCopy (itemA: DestinyInventoryItemDefinition, itemB: DestinyInventoryItemDefinition, powerCaps: Record<number, DestinyPowerCapDefinition>) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		const powerCapA = powerCaps[itemA.quality?.versions[itemA.quality.currentVersion]?.powerCapHash!];
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		const powerCapB = powerCaps[itemB.quality?.versions[itemB.quality.currentVersion]?.powerCapHash!];

		return 0
			|| +IGNORED_ITEMS.includes(itemA.hash) - +IGNORED_ITEMS.includes(itemB.hash)
			|| +!!itemB.collectibleHash - +!!itemA.collectibleHash
			|| +!itemB.plug - +!itemA.plug
			|| +((powerCapB?.powerCap ?? 0) > 900_000) - +((powerCapA?.powerCap ?? 0) > 900_000)
			|| +hasDeepsightSocket(itemB) - +hasDeepsightSocket(itemA);
	}
}

export default ItemPreferred;

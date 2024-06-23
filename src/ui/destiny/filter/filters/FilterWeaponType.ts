import { DestinyItemType } from "bungie-api-ts/destiny2";
import Inventory from "model/models/Inventory";
import WeaponTypes from "model/models/enum/WeaponTypes";
import Filter, { IFilter } from "ui/destiny/filter/Filter";
import Arrays from "utility/Arrays";

declare module "bungie-api-ts/destiny2/interfaces" {
	interface DestinyInventoryItemDefinition {
		itemTypeDisplayNameLowerCase?: string;
		itemTypeDisplayNameLowerCaseCompressed?: string;
	}
}

export default IFilter.async(async () => {
	const inventory = await Inventory.await();

	return ({
		id: Filter.WeaponType,
		prefix: "type:",
		colour: 0x333333,
		suggestedValueHint: "weapon type name",
		suggestedValues: inventory.getItems()
			.filter(item => item.definition.itemType === DestinyItemType.Weapon)
			.map(item => item.definition.itemTypeDisplayName)
			.filter(Arrays.filterFalsy)
			.sort()
			.distinct(),
		or: true,
		apply: (value, item) => {
			item.definition.itemTypeDisplayNameLowerCase ??= (item.definition.itemTypeDisplayName ?? "Unknown").toLowerCase();

			return item.definition.itemTypeDisplayNameLowerCase.startsWith(value);
		},
		maskIcon: WeaponTypes,
	});
});

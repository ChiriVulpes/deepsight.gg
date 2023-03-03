import { DestinyItemType } from "bungie-api-ts/destiny2";
import Inventory from "model/models/Inventory";
import Filter, { IFilter } from "ui/inventory/filter/Filter";
import { getWeaponTypeMaskIconPath } from "ui/inventory/sort/sorts/SortWeaponType";
import Arrays from "utility/Arrays";

declare module "bungie-api-ts/destiny2/interfaces" {
	interface DestinyInventoryItemDefinition {
		itemTypeDisplayNameLowerCase?: string;
		itemTypeDisplayNameLowerCaseCompressed?: string;
	}
}

export default IFilter.async(async () => {
	const inventory = await Inventory.createTemporary().await();
	const types = [...new Set(Object.values(inventory.items ?? {})
		.filter(item => item.definition.itemType === DestinyItemType.Weapon)
		.map(item => item.definition.itemTypeDisplayName)
		.filter(Arrays.filterFalsy))];

	const typesLowerCase = types.map(type => type.toLowerCase());

	return ({
		id: Filter.WeaponType,
		prefix: "type:",
		colour: 0x333333,
		suggestedValueHint: "weapon type name",
		suggestedValues: types,
		apply: (value, item) => {
			item.definition.itemTypeDisplayNameLowerCase ??= (item.definition.itemTypeDisplayName ?? "Unknown").toLowerCase();

			return item.definition.itemTypeDisplayNameLowerCase.startsWith(value);
		},
		maskIcon: item => {
			item = item.toLowerCase();
			const matching = typesLowerCase.filter(type => type.startsWith(item));
			return matching.length === 1 ? getWeaponTypeMaskIconPath(matching[0]) : undefined;
		},
	});
});

import Filter, { IFilter } from "ui/inventory/filter/Filter";

declare module "bungie-api-ts/destiny2/interfaces" {
	interface DestinyInventoryItemDefinition {
		itemTypeDisplayNameLowerCase?: string;
		itemTypeDisplayNameLowerCaseCompressed?: string;
	}
}

export default IFilter.create({
	id: Filter.WeaponType,
	prefix: "type:",
	colour: 0x333333,
	apply: (value, item) => {
		item.definition.itemTypeDisplayNameLowerCase ??= item.definition.itemTypeDisplayName.toLowerCase();
		item.definition.itemTypeDisplayNameLowerCaseCompressed ??= item.definition.itemTypeDisplayNameLowerCase
			.replace(/\s+/g, "");

		return item.definition.itemTypeDisplayNameLowerCase.startsWith(value)
			|| item.definition.itemTypeDisplayNameLowerCaseCompressed.startsWith(value);
	},
});

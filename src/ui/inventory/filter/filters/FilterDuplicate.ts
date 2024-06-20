import type Inventory from "model/models/Inventory";
import Filter, { IFilter } from "ui/inventory/filter/Filter";

declare const inventory: Inventory;

export default IFilter.createBoolean({
	id: Filter.Duplicate,
	colour: 0x555555,
	suggestedValues: ["duplicate"],
	matches: value => "dupe".startsWith(value) || "duplicate".startsWith(value),
	apply: (value, item) => value === ""
		|| !!inventory?.getItems(i => i.id !== item.id && i.getBaseName() === item.getBaseName()).length,
});

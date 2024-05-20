import Filter, { IFilter } from "ui/inventory/filter/Filter";

export default IFilter.createBoolean({
	id: Filter.Duplicate,
	colour: 0x555555,
	suggestedValues: ["duplicate"],
	matches: value => "dupe".startsWith(value) || "duplicate".startsWith(value),
	apply: (value, item) => value === ""
		|| !!item.inventory?.getItems(i => i.id !== item.id && i.getBaseName() === item.getBaseName()).length,
});

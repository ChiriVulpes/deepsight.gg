import Filter, { IFilter } from "ui/inventory/filter/Filter";

export default IFilter.create({
	id: Filter.Masterwork,
	prefix: "is:",
	colour: 0xd4b73c,
	suggestedValues: ["masterwork"],
	matches: value => "masterwork".startsWith(value),
	apply: (value, item) => value === "" || item.isMasterwork(),
});

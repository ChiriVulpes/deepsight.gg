import Filter, { IFilter } from "ui/inventory/filter/Filter";

export default IFilter.createBoolean({
	id: Filter.Masterwork,
	colour: 0xd4b73c,
	suggestedValues: ["masterwork"],
	matches: value => "masterwork".startsWith(value),
	apply: (value, item) => value === ""
		|| item.isMasterwork()
		|| item.definition.hash === 4257549985 // asc shard
		|| item.definition.hash === 4257549984 // enc prism
		|| item.definition.hash === 3853748946 // enc core
		|| item.definition.hash === 2979281381 // upg module
		|| item.definition.hash === 353704689, // asc alloy
});

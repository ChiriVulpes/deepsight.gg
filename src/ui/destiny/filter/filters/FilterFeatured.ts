import Filter, { IFilter } from "ui/destiny/filter/Filter";

export default IFilter.createBoolean({
	id: Filter.Featured,
	colour: 0x19afaf,
	suggestedValues: ["featured"],
	matches: value => "featured".startsWith(value),
	apply: (value, item) => value === ""
		|| item.definition.isFeaturedItem,
	// maskIcon: value => value === "" ? undefined
	// 	: "url(\"./image/svg/lock.svg\")",
});

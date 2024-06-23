import Filter, { IFilter } from "ui/destiny/filter/Filter";

export default IFilter.createBoolean({
	id: Filter.Shaped,
	colour: 0xff8d5c,
	suggestedValues: ["shaped"],
	matches: value => "shaped".startsWith(value),
	apply: (value, item) => value === "" || (item.bucket.isCollections() ? item.hasShapedCopy() : !!item.shaped),
	maskIcon: value => value === "" ? undefined
		: "url(\"./image/svg/shaped.svg\")",
});

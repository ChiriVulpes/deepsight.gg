import Filter, { IFilter } from "ui/inventory/filter/Filter";

export default IFilter.createBoolean({
	id: Filter.Pattern,
	colour: 0xCC2222,
	suggestedValues: ["pattern"],
	matches: value => "pattern".startsWith(value),
	apply: (value, item) => value === "" || (item.bucket.isCollections() ? !!item.deepsight?.pattern && !item.deepsight.pattern.progress?.complete : item.hasPattern()),
	maskIcon: value => value === "" ? undefined
		: "url(\"./image/svg/shaped.svg\")",
});

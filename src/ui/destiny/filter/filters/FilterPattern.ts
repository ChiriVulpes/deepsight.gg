import Filter, { IFilter } from "ui/destiny/filter/Filter";

export default IFilter.create({
	id: Filter.Pattern,
	prefix: "pattern:",
	colour: 0xCC2222,
	suggestedValues: ["available", "incomplete", "complete", "harmonizing"],
	apply: (value, item) => value === ""
		|| ("available".startsWith(value) && !item.bucket.isCollections() && item.hasPattern())
		|| ("harmonizing".startsWith(value) && (item.bucket.isCollections() ? item.hasPattern() : !!item.deepsight?.pattern && !item.deepsight.pattern.progress?.complete && item.deepsight.activation))
		|| ("incomplete".startsWith(value) && !!item.deepsight?.pattern && !item.deepsight.pattern.progress?.complete)
		|| ("complete".startsWith(value) && !!item.deepsight?.pattern?.progress?.complete)
		|| ("none".startsWith(value) && !item.deepsight?.pattern),
	maskIcon: value => value === "" ? undefined
		: "url(\"./image/svg/shaped.svg\")",
});

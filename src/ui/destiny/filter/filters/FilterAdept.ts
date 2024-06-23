import Filter, { IFilter } from "ui/destiny/filter/Filter";

export default IFilter.createBoolean({
	id: Filter.Adept,
	colour: 0xFFB21C,
	suggestedValues: ["adept"],
	matches: value => "adept".startsWith(value),
	apply: (value, item) => value === "" || !!item.isAdept(),
	maskIcon: value => value === "" ? undefined
		: "url(\"./image/svg/enhanced.svg\")",
});

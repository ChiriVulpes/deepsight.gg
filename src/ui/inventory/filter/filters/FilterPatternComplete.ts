import Filter, { IFilter } from "ui/inventory/filter/Filter";

export default IFilter.createBoolean({
	id: Filter.PatternComplete,
	colour: 0x33170c,
	suggestedValues: ["pattern-complete"],
	matches: value => "pattern-complete".startsWith(value),
	apply: (value, item) => value === "" || (!!item.deepsight?.pattern?.progress?.complete && !item.shaped),
	maskIcon: value => value === "" ? undefined
		: "url(\"./image/svg/shaped.svg\")",
});

import Filter, { IFilter } from "ui/inventory/filter/Filter";

export default IFilter.create({
	id: Filter.Harmonizable,
	prefix: "is:",
	colour: 0xff4e26,
	suggestedValues: ["harmonizer"],
	matches: value => "harmonizer".startsWith(value),
	apply: (value, item) => value === "" || !!item.deepsight?.activation,
	maskIcon: value => value === "" ? undefined
		: "url(\"./image/svg/shaped.svg\")",
});

import Filter, { IFilter } from "ui/inventory/filter/Filter";

export default IFilter.createBoolean({
	id: Filter.Harmonizable,
	colour: 0xff4e26,
	suggestedValues: ["harmonizer"],
	matches: value => "harmonizer".startsWith(value),
	apply: (value, item) => value === "" || !!item.deepsight?.activation,
	maskIcon: value => value === "" ? undefined
		: "url(\"./image/svg/shaped.svg\")",
});

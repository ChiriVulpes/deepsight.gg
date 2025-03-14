import Filter, { IFilter } from "ui/destiny/filter/Filter";

export default IFilter.createBoolean({
	id: Filter.Enhancement,
	colour: 0xE3513C,
	suggestedValues: ["enhancement"],
	matches: value => "enhancement".startsWith(value),
	apply: (value, item) => value === "" || (!!item.canEnhance() && !item.isMasterwork()),
	maskIcon: value => value === "" ? undefined
		: "url(\"./image/svg/enhanced.svg\")",
});

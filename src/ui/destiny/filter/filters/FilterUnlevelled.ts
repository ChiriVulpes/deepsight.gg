import Filter, { IFilter } from "ui/destiny/filter/Filter";

export default IFilter.createBoolean({
	id: Filter.Unlevelled,
	colour: 0x964A42,
	suggestedValues: ["unlevelled"],
	matches: value => "unlevelled".startsWith(value) || "unleveled".startsWith(value),
	apply: (value, item) => value === "" || (!!item.shaped && !item.isMasterwork() && (item.shaped.level?.progress.progress ?? 0) < 17),
	maskIcon: value => value === "" ? undefined
		: "url(\"./image/svg/shaped.svg\")",
});

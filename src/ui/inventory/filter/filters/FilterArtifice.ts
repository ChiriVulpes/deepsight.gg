import Filter, { IFilter } from "ui/inventory/filter/Filter";

export default IFilter.createBoolean({
	id: Filter.Artifice,
	colour: 0x817C7C,
	suggestedValues: ["artifice"],
	matches: value => "artifice".startsWith(value),
	apply: (value, item) => value === "" || !!item.isArtifice(),
	maskIcon: value => value === "" ? undefined
		: "url(\"./image/png/item/artifice.png\")",
});

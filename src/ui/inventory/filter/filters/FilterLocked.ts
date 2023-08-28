import Filter, { IFilter } from "ui/inventory/filter/Filter";

export default IFilter.create({
	id: Filter.Locked,
	prefix: "is:",
	colour: 0xAAAAAA,
	suggestedValues: ["locked"],
	matches: value => "locked".startsWith(value),
	apply: (value, item) => value === ""
		|| item.isLocked()
		|| item.isChangingLockState(),
	maskIcon: value => value === "" ? undefined
		: "url(\"/image/svg/lock.svg\")",
});

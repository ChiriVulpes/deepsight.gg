import { DestinyRecordState } from "bungie-api-ts/destiny2";
import Filter, { IFilter } from "ui/destiny/filter/Filter";

const defaultState = DestinyRecordState.Invisible | DestinyRecordState.Obscured | DestinyRecordState.ObjectiveNotCompleted;

export default IFilter.create({
	id: Filter.Catalyst,
	prefix: "catalyst:",
	colour: 0xCEAE33,
	suggestedValues: ["incomplete", "unacquired", "complete", "none"],
	apply: (value, item) => value === ""
		|| ("none".startsWith(value) && !item.catalyst)
		|| ("unacquired".startsWith(value) && !!((item.catalyst?.state.state ?? defaultState) & DestinyRecordState.Obscured))
		|| ("acquired".startsWith(value) && !((item.catalyst?.state.state ?? defaultState) & DestinyRecordState.Obscured))
		|| ("incomplete".startsWith(value) && !((item.catalyst?.state.state ?? defaultState) & DestinyRecordState.Obscured) && !item.catalyst?.complete)
		|| ("complete".startsWith(value) && !!item.catalyst?.complete),
	maskIcon: value => value === "" ? undefined
		: "url(\"./image/svg/masterwork.svg\")",
});

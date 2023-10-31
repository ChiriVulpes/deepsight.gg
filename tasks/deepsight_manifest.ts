import destiny_manifest from "./destiny_manifest";
import DeepsightDropTableDefinition from "./manifest/DeepsightDropTableDefinition";
import DeepsightMomentDefinition from "./manifest/DeepsightMomentDefinition";
import Task from "./utilities/Task";

export default Task("deepsight_manifest", task => task.series(
	destiny_manifest,
	task.parallel(
		DeepsightMomentDefinition,
		DeepsightDropTableDefinition,
	),
));

import destiny_manifest from "./destiny_manifest";
import generate_enums from "./generate_enums";
import DeepsightDropTableDefinition from "./manifest/DeepsightDropTableDefinition";
import DeepsightMomentDefinition from "./manifest/DeepsightMomentDefinition";
import DeepsightPlugTypeDefinition from "./manifest/DeepsightPlugCategorisation";
import Task from "./utilities/Task";

export default Task("deepsight_manifest", task => task.series(
	destiny_manifest,
	generate_enums,
	task.parallel(
		DeepsightMomentDefinition,
		DeepsightDropTableDefinition,
	),
	DeepsightPlugTypeDefinition,
));

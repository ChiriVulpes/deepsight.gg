import bump_versions from "./bump_versions";
import copy_manifest from "./copy_manifest";
import destiny_manifest from "./destiny_manifest";
import generate_enums from "./generate_enums";
import DeepsightDropTableDefinition from "./manifest/DeepsightDropTableDefinition";
import DeepsightMomentDefinition from "./manifest/DeepsightMomentDefinition";
import DeepsightPlugTypeDefinition from "./manifest/DeepsightPlugCategorisation";
import DeepsightTierTypeDefinition from "./manifest/DeepsightTierTypeDefinition";
import DeepsightTypes from "./manifest/DeepsightTypes";
import DeepsightWallpaperDefinition from "./manifest/DeepsightWallpaperDefinition";
import Task from "./utilities/Task";

export default Task("deepsight_manifest", task => task.series(
	copy_manifest,
	destiny_manifest,
	generate_enums,
	task.parallel(
		DeepsightMomentDefinition,
		DeepsightDropTableDefinition,
		DeepsightWallpaperDefinition,
		DeepsightTierTypeDefinition,
		DeepsightTypes,
	),
	DeepsightPlugTypeDefinition,
	bump_versions,
));

import fs from "fs-extra";
import Log from "../utilities/Log";
import Task from "../utilities/Task";
import Time from "../utilities/Time";
import manifest, { DESTINY_MANIFEST_MISSING_ICON_PATH } from "./DestinyManifest";
import DestinyManifestReference from "./DestinyManifestReference";
import { ActivityModeHashes } from "./Enums";
import DeepsightDropTableDefinition from "./droptable/DeepsightDropTableDefinition";
import PGCR, { DestinyActivityModeType } from "./droptable/PGCR";

interface DeepsightDropTableDefinition {
	hash: number;
	rotationActivityHash?: number;
	recordHash?: number;
	displayProperties?: {
		name?: string | DestinyManifestReference;
		description?: string | DestinyManifestReference;
		icon?: string | DestinyManifestReference;
	};
}

export default Task("DeepsightDropTableDefinition", async () => {
	const { DestinyActivityDefinition, DestinyRecordDefinition } = manifest;

	for (const [hash, definition] of Object.entries(DeepsightDropTableDefinition)) {
		definition.hash = +hash;

		const record = await DestinyRecordDefinition.get(definition.recordHash);
		const activity = await DestinyActivityDefinition.get(hash) ?? await DestinyActivityDefinition.get(definition.rotationActivityHash);

		if (definition.displayProperties) {
			definition.displayProperties.name = await DestinyManifestReference.resolve(definition.displayProperties.name, "name", { record, activity });
			definition.displayProperties.description = await DestinyManifestReference.resolve(definition.displayProperties.description, "description", { record, activity });
			const icon = await DestinyManifestReference.resolve(definition.displayProperties.icon, "icon", { record, activity });
			if (icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				definition.displayProperties.icon = icon;
		}

		definition.displayProperties ??= {};

		if (activity) {
			definition.displayProperties.description ??= activity.displayProperties.description;
		}

		if (record) {
			definition.displayProperties.name ??= record.displayProperties.name;
			definition.displayProperties.description ??= record.displayProperties.description;
			if (record.displayProperties.icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				definition.displayProperties.icon ??= record.displayProperties.icon;
		}

		if (activity) {
			definition.displayProperties.name ??= activity.displayProperties.name;
			if (activity.displayProperties.icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				definition.displayProperties.icon ??= activity.displayProperties.icon;
		}

		definition.displayProperties.name ??= "";
		definition.displayProperties.description ??= "";
	}

	if (Time.lastTrialsReset > Time.lastWeeklyReset) {
		const trialsPGCR = await PGCR.findByMode(DestinyActivityModeType.TrialsOfOsiris);
		const activityDef = await manifest.DestinyActivityDefinition.get(trialsPGCR?.activityDetails.referenceId);
		Log.info("Trials Map:", activityDef?.displayProperties.name, trialsPGCR?.activityDetails.referenceId);
		DeepsightDropTableDefinition.trials = activityDef && {
			hash: activityDef.hash,
			displayProperties: {
				name: activityDef.displayProperties.name,
				description: activityDef.displayProperties.description,
				icon: (await manifest.DestinyActivityModeDefinition.get(ActivityModeHashes.TrialsOfOsiris))?.displayProperties.icon,
			},
		};
	}

	const lostSectorPGCR = await PGCR.findByMode(DestinyActivityModeType.LostSector);
	const lostSectorDef = await manifest.DestinyActivityDefinition.get(lostSectorPGCR?.activityDetails.referenceId);
	Log.info("Lost Sector:", lostSectorDef?.displayProperties.name, lostSectorPGCR?.activityDetails.referenceId);
	DeepsightDropTableDefinition.lostSector = lostSectorDef && {
		hash: lostSectorDef.hash,
		displayProperties: {
			name: lostSectorDef.originalDisplayProperties.name,
			icon: (await manifest.DestinyActivityModeDefinition.get(ActivityModeHashes.LostSector))?.displayProperties.icon,
		},
	};

	// Log.info("Nightfall:", nightfallDef?.displayProperties.name, nightfallPGCR?.activityDetails.referenceId);
	// DeepsightDropTableDefinition.nightfall = nightfallDef && {
	// 	hash: nightfallDef.hash,
	// 	displayProperties: {
	// 		name: nightfallDef.originalDisplayProperties.name,
	// 		icon: "./image/png/activity/strike.png",
	// 	},
	// };

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightDropTableDefinition.json", DeepsightDropTableDefinition, { spaces: "\t" });
});

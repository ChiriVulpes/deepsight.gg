import fs from "fs-extra";
import JSON5 from "../utilities/JSON5";
import Task from "../utilities/Task";
import manifest, { DESTINY_MANIFEST_MISSING_ICON_PATH } from "./DestinyManifest";
import DestinyManifestReference from "./DestinyManifestReference";

interface DeepsightDropTableDefinition {
	rotationActivityHash?: string;
	recordHash?: string;
	displayProperties?: {
		name?: string | DestinyManifestReference;
		description?: string | DestinyManifestReference;
		icon?: string | DestinyManifestReference;
	};
}

export default Task("DeepsightDropTableDefinition", async () => {
	const DeepsightDropTableDefinition = await JSON5.readFile<Record<number, DeepsightDropTableDefinition>>("static/manifest/DeepsightDropTableDefinition.json5");

	const { DestinyActivityDefinition, DestinyRecordDefinition } = manifest;

	for (const [hash, definition] of Object.entries(DeepsightDropTableDefinition)) {
		if (definition.displayProperties) {
			definition.displayProperties.name = await DestinyManifestReference.resolve(definition.displayProperties.name, "name");
			definition.displayProperties.description = await DestinyManifestReference.resolve(definition.displayProperties.description, "description");
			const icon = await DestinyManifestReference.resolve(definition.displayProperties.icon, "icon");
			if (icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				definition.displayProperties.icon = icon;
		}

		definition.displayProperties ??= {};

		const record = await DestinyRecordDefinition.get(definition.recordHash);
		if (record) {
			definition.displayProperties.name ??= record.displayProperties.name;
			definition.displayProperties.description ??= record.displayProperties.description;
			if (record.displayProperties.icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				definition.displayProperties.icon ??= record.displayProperties.icon;
		}

		const activity = await DestinyActivityDefinition.get(hash) ?? await DestinyActivityDefinition.get(definition.rotationActivityHash);
		if (activity) {
			definition.displayProperties.name ??= activity.displayProperties.name;
			definition.displayProperties.description ??= activity.displayProperties.description;
			if (activity.displayProperties.icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				definition.displayProperties.icon ??= activity.displayProperties.icon;
		}

		definition.displayProperties.name ??= "";
		definition.displayProperties.description ??= "";
	}

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightDropTableDefinition.json", DeepsightDropTableDefinition, { spaces: "\t" });
});

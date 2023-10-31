import fs from "fs-extra";
import JSON5 from "../utilities/JSON5";
import Task from "../utilities/Task";
import manifest, { DESTINY_MANIFEST_MISSING_ICON_PATH } from "./DestinyManifest";
import DestinyManifestReference from "./DestinyManifestReference";

interface DeepsightMomentDefinition {
	displayProperties?: {
		name?: string | DestinyManifestReference;
		description?: string | DestinyManifestReference;
		icon?: string | DestinyManifestReference;
	};
	iconWatermark: string | DestinyManifestReference;
	event?: true | number;
	seasonHash?: number;
}

export default Task("DeepsightMomentDefinition", async () => {
	const DeepsightMomentDefinition = await JSON5.readFile<Record<number, DeepsightMomentDefinition>>("static/manifest/DeepsightMomentDefinition.json5");

	const { DestinySeasonDefinition, DestinyEventCardDefinition } = manifest;

	for (const [hash, definition] of Object.entries(DeepsightMomentDefinition)) {
		definition.iconWatermark = await DestinyManifestReference.resolve(definition.iconWatermark, "iconWatermark") ?? definition.iconWatermark;
		if (definition.displayProperties) {
			definition.displayProperties.name = await DestinyManifestReference.resolve(definition.displayProperties.name, "name");
			definition.displayProperties.description = await DestinyManifestReference.resolve(definition.displayProperties.description, "description");
			const icon = await DestinyManifestReference.resolve(definition.displayProperties.icon, "icon");
			if (icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				definition.displayProperties.icon = icon;
		}

		definition.displayProperties ??= {};

		const season = await DestinySeasonDefinition.get(definition.seasonHash);
		if (season) {
			definition.displayProperties.name ??= season.displayProperties.name;
			definition.displayProperties.description ??= season.displayProperties.description;
			if (season.displayProperties.icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				definition.displayProperties.icon ??= season.displayProperties.icon;
		}

		const event = await DestinyEventCardDefinition.get(definition.event === true ? undefined : definition.event);
		if (event) {
			definition.displayProperties.name ??= event.displayProperties.name;
			definition.displayProperties.description ??= event.displayProperties.description;
			if (event.displayProperties.icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				definition.displayProperties.icon ??= event.displayProperties.icon;
		}

		definition.displayProperties.name ??= "";
		definition.displayProperties.description ??= "";
	}

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightMomentDefinition.json", DeepsightMomentDefinition, { spaces: "\t" });
});

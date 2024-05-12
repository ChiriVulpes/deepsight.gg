import type { PromiseOr } from "@deepsight.gg/utility/Type";
import fs from "fs-extra";
import JSON5 from "../utility/JSON5";
import Task from "../utility/Task";
import DestinyManifestReference from "./DestinyManifestReference";
import manifest, { DESTINY_MANIFEST_MISSING_ICON_PATH } from "./utility/endpoint/DestinyManifest";

interface DeepsightMomentDefinition {
	displayProperties?: {
		name?: string | DestinyManifestReference;
		description?: string | DestinyManifestReference;
		icon?: string | DestinyManifestReference;
	};
	iconWatermark: string | DestinyManifestReference;
	iconWatermarkShelved: string | DestinyManifestReference;
	event?: true | number;
	seasonHash?: number;
	hash?: number;
}

let DeepsightMomentDefinition: PromiseOr<Record<number, DeepsightMomentDefinition>> | undefined;

export async function getDeepsightMomentDefinition () {
	DeepsightMomentDefinition ??= computeDeepsightMomentDefinition();
	return DeepsightMomentDefinition = await DeepsightMomentDefinition;
}

async function computeDeepsightMomentDefinition () {
	const DeepsightMomentDefinition = await JSON5.readFile<Record<number, DeepsightMomentDefinition>>("static/manifest/DeepsightMomentDefinition.json5");

	const { DestinySeasonDefinition, DestinyEventCardDefinition } = manifest;

	for (const [hash, definition] of Object.entries(DeepsightMomentDefinition)) {
		definition.hash = +hash;

		definition.iconWatermarkShelved = await DestinyManifestReference.resolve(definition.iconWatermarkShelved ?? (typeof definition.iconWatermark === "object" ? definition.iconWatermark : undefined), "iconWatermarkShelved") ?? definition.iconWatermarkShelved;
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

	return DeepsightMomentDefinition;
}

export default Task("DeepsightMomentDefinition", async () => {
	DeepsightMomentDefinition = undefined;
	const manifest = await getDeepsightMomentDefinition();

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightMomentDefinition.json", manifest, { spaces: "\t" });
});

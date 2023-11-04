import type { AllDestinyManifestComponents, DestinyDisplayPropertiesDefinition } from "../../src/node_modules/bungie-api-ts/destiny2";
import type { DestinyManifestComponentValue } from "./DestinyManifest";
import manifest from "./DestinyManifest";

interface HasDisplayPropertiesOrIconWatermark {
	displayProperties?: DestinyDisplayPropertiesDefinition;
	iconWatermark?: string;
	iconWatermarkShelved?: string;
}

type DestinyManifestReference = { [KEY in keyof AllDestinyManifestComponents]?: number };
namespace DestinyManifestReference {
	export async function resolve (ref: string | DestinyManifestReference | undefined, type: "name" | "description" | "icon" | "iconWatermark" | "iconWatermarkShelved", alternativeSources?: Record<string, HasDisplayPropertiesOrIconWatermark | undefined>) {
		if (typeof ref === "string" || ref === undefined)
			return ref;

		for (const [key, hash] of Object.entries(ref)) {
			const alternativeSource = alternativeSources?.[key];

			const componentName = key as keyof AllDestinyManifestComponents;
			const definition = alternativeSource ?? await manifest[componentName].get(hash) as DestinyManifestComponentValue;
			if (!definition)
				continue;

			if (type === "iconWatermark") {
				if ("iconWatermark" in definition)
					return definition.iconWatermark;
				continue;
			}

			if (type === "iconWatermarkShelved") {
				if ("iconWatermarkShelved" in definition)
					return definition.iconWatermarkShelved;
				continue;
			}

			const displayProperties = "displayProperties" in definition ? definition.displayProperties : undefined;
			if (!displayProperties)
				continue;

			return displayProperties[type];
		}

		return undefined;
	}
}

export default DestinyManifestReference;

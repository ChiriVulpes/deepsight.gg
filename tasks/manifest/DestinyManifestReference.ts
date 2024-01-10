import type { AllDestinyManifestComponents, DestinyDisplayPropertiesDefinition } from "bungie-api-ts/destiny2";
import type { BungieIconPath, DeepsightDisplayPropertiesDefinition, DeepsightIconPath } from "../../static/manifest/Interfaces";
import type { DestinyManifestComponentValue } from "./utility/endpoint/DestinyManifest";
import manifest, { DESTINY_MANIFEST_MISSING_ICON_PATH } from "./utility/endpoint/DestinyManifest";

interface HasDisplayPropertiesOrIconWatermark {
	displayProperties?: DestinyDisplayPropertiesDefinition;
	iconWatermark?: string;
	iconWatermarkShelved?: string;
}

type DestinyManifestReference = { [KEY in keyof AllDestinyManifestComponents]?: number };
namespace DestinyManifestReference {
	export interface DisplayPropertiesDefinition {
		name?: string | DestinyManifestReference;
		description?: string | DestinyManifestReference;
		icon?: string | DestinyManifestReference;
	}

	export async function resolve (ref: string | DestinyManifestReference | undefined, type: "name" | "description" | "icon" | "iconWatermark" | "iconWatermarkShelved", alternativeSources?: Record<string, HasDisplayPropertiesOrIconWatermark | undefined>) {
		if (typeof ref === "string")
			return ref;

		for (const [key, hash] of Object.entries(ref ?? {})) {
			const componentName = key as keyof AllDestinyManifestComponents;
			const definition = await manifest[componentName].get(hash);
			if (!definition)
				continue;

			const result = resolveSource(definition as DestinyManifestComponentValue, type);
			if (result)
				return result;
		}

		for (const [key, definition] of Object.entries(alternativeSources ?? {})) {
			if (!definition)
				continue;

			const result = resolveSource(definition as DestinyManifestComponentValue, type);
			if (result)
				return result;
		}

		return undefined;
	}

	function resolveSource (definition: DestinyManifestComponentValue, type: "name" | "description" | "icon" | "iconWatermark" | "iconWatermarkShelved") {
		if (!definition)
			return undefined;

		if (type === "iconWatermark") {
			if ("iconWatermark" in definition)
				return definition.iconWatermark || undefined;
			return undefined;
		}

		if (type === "iconWatermarkShelved") {
			if ("iconWatermarkShelved" in definition)
				return definition.iconWatermarkShelved || undefined;
			return undefined;
		}

		const displayProperties = "displayProperties" in definition ? definition.displayProperties : undefined;
		if (!displayProperties)
			return undefined;

		return displayProperties[type] || undefined;
	}

	export async function resolveAll (displayProperties?: DestinyManifestReference.DisplayPropertiesDefinition, alternativeSources?: Record<string, HasDisplayPropertiesOrIconWatermark | undefined>) {
		const givenDisplayProperties = displayProperties;
		displayProperties ??= {};
		if (givenDisplayProperties || alternativeSources) {
			displayProperties.name = await DestinyManifestReference.resolve(givenDisplayProperties?.name, "name", alternativeSources);
			displayProperties.description = await DestinyManifestReference.resolve(givenDisplayProperties?.description, "description", alternativeSources);
			const icon = await DestinyManifestReference.resolve(givenDisplayProperties?.icon, "icon", alternativeSources);
			if (icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				displayProperties.icon = icon as DeepsightIconPath | BungieIconPath;
		}

		displayProperties.name ??= "";
		displayProperties.description ??= "";

		return displayProperties as DeepsightDisplayPropertiesDefinition;
	}

	export async function displayOf (type: keyof AllDestinyManifestComponents, which: number) {
		return (await manifest[type].get(which) as HasDisplayPropertiesOrIconWatermark)?.displayProperties;
	}
}

export default DestinyManifestReference;

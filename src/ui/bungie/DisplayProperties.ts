import type { DestinyDisplayPropertiesDefinition } from "bungie-api-ts/destiny2";

export type DisplayPropertied = DestinyDisplayPropertiesDefinition | { displayProperties: DestinyDisplayPropertiesDefinition };

namespace Display {
	export function icon (url?: string): string | undefined;
	export function icon (displayProperties?: DisplayPropertied): string | undefined;
	export function icon (displayProperties?: DisplayPropertied | string) {
		let url = displayProperties === undefined ? undefined : typeof displayProperties === "string" ? displayProperties
			: getIconURL("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties);
		if (!url)
			return undefined;

		if (!url.startsWith("https://www.bungie.net"))
			url = `https://www.bungie.net${url}`;
		return `url("${url}")`;
	}

	export function name (displayProperties?: DisplayPropertied) {
		return displayProperties === undefined ? undefined
			: ("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties)
				.name;
	}

	export function description (displayProperties?: DisplayPropertied) {
		return displayProperties === undefined ? undefined
			: ("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties)
				.description;
	}

	export function descriptionIfShortOrName (displayProperties?: DisplayPropertied) {
		if (displayProperties === undefined)
			return undefined;

		displayProperties = "displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties;

		if (displayProperties.description?.length && (displayProperties.description?.length ?? 0) < 32)
			return displayProperties.description;

		return displayProperties.name;
	}

	function getIconURL (displayProperties: DestinyDisplayPropertiesDefinition) {
		const icon = displayProperties.icon;
		if (icon?.endsWith(".png"))
			return icon;

		return displayProperties.iconSequences
			?.flatMap(icon => icon.frames.filter(frame => frame.endsWith(".png")))
			?.[0]
			?? icon;
	}
}

export default Display;

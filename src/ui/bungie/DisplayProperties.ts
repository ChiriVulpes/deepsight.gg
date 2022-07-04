import type { DestinyDisplayPropertiesDefinition } from "bungie-api-ts/destiny2";

export type DisplayPropertied = DestinyDisplayPropertiesDefinition | { displayProperties: DestinyDisplayPropertiesDefinition };

namespace Display {
	export function icon (displayProperties?: DisplayPropertied) {
		const url = displayProperties === undefined ? undefined
			: getIconURL("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties);
		return url ? `url("https://www.bungie.net${url}")` : undefined;
	}

	export function name (displayProperties?: DisplayPropertied) {
		return displayProperties === undefined ? undefined
			: ("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties)
				.name;
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

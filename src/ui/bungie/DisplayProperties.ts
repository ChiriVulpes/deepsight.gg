import type { DestinyDisplayPropertiesDefinition } from "bungie-api-ts/destiny2";

declare module "bungie-api-ts/destiny2/interfaces" {
	interface DestinyDisplayPropertiesDefinition {
		nameLowerCase?: string;
	}
}

export type DisplayPropertied = { readonly displayProperties: DestinyDisplayPropertiesDefinition };
export type DisplayPropertiesOrD = DestinyDisplayPropertiesDefinition | DisplayPropertied;

namespace Display {
	export function icon (url?: string, wrapped?: boolean): string | undefined;
	export function icon (displayProperties?: DisplayPropertiesOrD, wrapped?: boolean): string | undefined;
	export function icon (displayProperties?: DisplayPropertiesOrD | string, wrapped = true) {
		let url = displayProperties === undefined ? undefined : typeof displayProperties === "string" ? displayProperties
			: getIconURL("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties);
		if (!url)
			return undefined;

		if (!url.startsWith("https://www.bungie.net"))
			url = `https://www.bungie.net${url}`;
		return wrapped ? `url("${url}")` : url;
	}

	export function name (displayProperties?: DisplayPropertiesOrD) {
		return displayProperties === undefined ? undefined
			: ("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties)
				.name;
	}

	export function description (displayProperties?: DisplayPropertiesOrD) {
		return displayProperties === undefined ? undefined
			: ("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties)
				.description;
	}

	export function descriptionIfShortOrName (detailedDisplayProperties?: DisplayPropertiesOrD, simpleDisplayProperties?: DisplayPropertiesOrD) {
		if (detailedDisplayProperties === undefined) {
			if (simpleDisplayProperties === undefined)
				return undefined;
			else
				detailedDisplayProperties = simpleDisplayProperties;
		}

		detailedDisplayProperties = "displayProperties" in detailedDisplayProperties ? detailedDisplayProperties.displayProperties : detailedDisplayProperties;

		if (detailedDisplayProperties.description?.length && (detailedDisplayProperties.description?.length ?? 0) < 32)
			return detailedDisplayProperties.description;

		if (detailedDisplayProperties.name?.length && (detailedDisplayProperties.name?.length ?? 0) < 32 || !simpleDisplayProperties)
			return detailedDisplayProperties.name;

		simpleDisplayProperties = "displayProperties" in simpleDisplayProperties ? simpleDisplayProperties.displayProperties : simpleDisplayProperties;
		return simpleDisplayProperties?.name;
	}

	export function nameIfShortOrName (detailedDisplayProperties?: DisplayPropertiesOrD, simpleDisplayProperties?: DisplayPropertiesOrD) {
		if (detailedDisplayProperties === undefined) {
			if (simpleDisplayProperties === undefined)
				return undefined;
			else
				detailedDisplayProperties = simpleDisplayProperties;
		}

		detailedDisplayProperties = "displayProperties" in detailedDisplayProperties ? detailedDisplayProperties.displayProperties : detailedDisplayProperties;

		if (detailedDisplayProperties.name?.length && (detailedDisplayProperties.name?.length ?? 0) < 32 || !simpleDisplayProperties)
			return detailedDisplayProperties.name;

		simpleDisplayProperties = "displayProperties" in simpleDisplayProperties ? simpleDisplayProperties.displayProperties : simpleDisplayProperties;
		return simpleDisplayProperties?.name;
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

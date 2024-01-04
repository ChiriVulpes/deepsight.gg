import type { DestinyDisplayPropertiesDefinition } from "bungie-api-ts/destiny2";
import ProfileBatch from "model/models/ProfileBatch";
import type { EnumModelMapString } from "model/models/enum/EnumModelMap";
import EnumModelMap from "model/models/enum/EnumModelMap";
import type { CharacterId } from "model/models/items/Item";
import Component from "ui/Component";
import EnumIcon from "ui/bungie/EnumIcon";

declare module "bungie-api-ts/destiny2/interfaces" {
	interface DestinyDisplayPropertiesDefinition {
		nameLowerCase?: string;
	}
}

export type DisplayPropertied = { readonly displayProperties: Partial<DestinyDisplayPropertiesDefinition> };
export type DisplayPropertiesOrD = DestinyDisplayPropertiesDefinition | DisplayPropertied;
export type PartialDisplayPropertiesOrD = Partial<DestinyDisplayPropertiesDefinition> | DisplayPropertied;

namespace Display {

	export function make (name: string, description = "", others?: Partial<DestinyDisplayPropertiesDefinition>): DestinyDisplayPropertiesDefinition {
		return {
			name,
			description,
			icon: "",
			iconSequences: [],
			hasIcon: false,
			highResIcon: "",
			...others,
		};
	}

	export function icon (url?: string, wrapped?: boolean): string | undefined;
	export function icon (displayProperties?: PartialDisplayPropertiesOrD, wrapped?: boolean): string | undefined;
	export function icon (displayProperties?: PartialDisplayPropertiesOrD | string, wrapped = true) {
		let url = displayProperties === undefined ? undefined : typeof displayProperties === "string" ? displayProperties
			: getIconURL("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties);
		if (!url)
			return undefined;

		if (!url.startsWith("https://") && !url.startsWith("./"))
			url = `https://www.bungie.net${url}`;
		return wrapped ? `url("${url}")` : url;
	}

	export function name (displayProperties?: PartialDisplayPropertiesOrD) {
		return displayProperties === undefined ? undefined
			: ("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties)
				.name;
	}

	const interpolationRegex = /(\{var:\d+\})|(\[[\w-]+\])/g;
	interface DescriptionOptions {
		character?: CharacterId;
		/**
		 * Whether to convert newlines into slashes.
		 */
		singleLine?: true;
	}

	export async function applyDescription (component: Component, description?: string, options?: DescriptionOptions | CharacterId) {
		component.removeContents();
		if (!description)
			return;

		const character = typeof options === "string" ? options : options?.character;
		options = typeof options === "string" ? {} : options;

		if (options?.singleLine)
			description = description.replace(/(\s*\n\s*)+/g, " \xa0 / \xa0 ");

		const split = description.split(interpolationRegex);
		if (split.length < 2)
			return component.text.set(description);

		const { profileStringVariables, characterStringVariables } = await ProfileBatch.await();
		for (const section of split) {
			if (!section)
				continue;

			switch (section[0]) {
				case "[": {
					const iconName = section
						.slice(1, -1)
						.toLowerCase()
						.replace(/\W+/g, "-");

					const enumIconPath = EnumModelMap[iconName as EnumModelMapString];
					if (!enumIconPath) {
						console.warn("No entry in EnumModelMap for", iconName);
						break;
					}

					component.append(EnumIcon.create([...enumIconPath]));
					break;
				}
				case "{": {
					const hash = section.slice(5, -1);
					const value = characterStringVariables?.data?.[character!]?.integerValuesByHash[+hash]
						?? profileStringVariables?.data?.integerValuesByHash[+hash]
						?? 0;

					component.append(Component.create("span")
						.classes.add("var")
						.text.set(`${value}`));
					break;
				}
				default:
					component.text.add(section);
			}

		}
	}

	export function description (displayProperties?: PartialDisplayPropertiesOrD) {
		return displayProperties === undefined ? undefined
			: ("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties)
				.description;
	}

	export function descriptionIfShortOrName (detailedDisplayProperties?: PartialDisplayPropertiesOrD, simpleDisplayProperties?: PartialDisplayPropertiesOrD) {
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

	export function nameIfShortOrName (detailedDisplayProperties?: PartialDisplayPropertiesOrD, simpleDisplayProperties?: PartialDisplayPropertiesOrD) {
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

	function getIconURL (displayProperties?: Partial<DestinyDisplayPropertiesDefinition>) {
		const icon = displayProperties?.icon;
		// if (icon?.endsWith(".png"))
		// 	return icon;

		return icon
			?? displayProperties?.iconSequences
				?.flatMap(icon => icon.frames.filter(frame => frame.endsWith(".png")))?.[0]
			?? icon;
	}
}

export default Display;

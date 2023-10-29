import type { DestinyDisplayPropertiesDefinition } from "bungie-api-ts/destiny2";
import ProfileBatch from "model/models/ProfileBatch";
import type { CharacterId } from "model/models/items/Item";
import Component from "ui/Component";

declare module "bungie-api-ts/destiny2/interfaces" {
	interface DestinyDisplayPropertiesDefinition {
		nameLowerCase?: string;
	}
}

export type DisplayPropertied = { readonly displayProperties: DestinyDisplayPropertiesDefinition };
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

	const varRegex = /\{var:(\d+)\}/g;
	export async function applyDescription (component: Component, description?: string, character?: CharacterId) {
		component.removeContents();
		if (!description)
			return;

		const split = description.split(varRegex);
		if (split.length < 2)
			return component.text.set(description);

		const { profileStringVariables, characterStringVariables } = await ProfileBatch.await();
		for (const section of split) {
			if (!section)
				continue;

			if (isNaN(+section)) {
				component.text.add(section);
				continue;
			}

			const value = characterStringVariables?.data?.[character!]?.integerValuesByHash[+section]
				?? profileStringVariables?.data?.integerValuesByHash[+section]
				?? 0;

			component.append(Component.create("span")
				.classes.add("var")
				.text.set(`${value}`));
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
		if (icon?.endsWith(".png"))
			return icon;

		return displayProperties?.iconSequences
			?.flatMap(icon => icon.frames.filter(frame => frame.endsWith(".png")))
			?.[0]
			?? icon;
	}
}

export default Display;

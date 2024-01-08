import type { DestinyDisplayPropertiesDefinition, DestinyTraitDefinition } from "bungie-api-ts/destiny2";
import Manifest from "model/models/Manifest";
import ProfileBatch from "model/models/ProfileBatch";
import type { EnumModelMapString } from "model/models/enum/EnumModelMap";
import EnumModelMap from "model/models/enum/EnumModelMap";
import type { CharacterId } from "model/models/items/Item";
import Component from "ui/Component";
import EnumIcon from "ui/bungie/EnumIcon";
import type { PromiseOr } from "utility/Type";

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
	export interface DescriptionOptions {
		character?: CharacterId;
		/**
		 * Whether to convert newlines into slashes.
		 */
		singleLine?: true;
		/**
		 * Do not fill this in yourself, this property will be filled in by `applyDescription`
		 */
		keywords?: PromiseOr<DestinyTraitDefinition[]>;
	}

	interface TraitDef extends DestinyTraitDefinition {
		displayProperties: DestinyTraitDefinition["displayProperties"] & {
			nameLowercaseVariations: string[];
		};
	}

	function getVariations (name: string) {
		const variations = [name];
		variations.push(name + "d", name + "ed");

		if (name.endsWith("d"))
			variations.push(...getVariations(name.slice(0, -1)));

		if (name.endsWith("ed"))
			variations.push(...getVariations(name.slice(0, -2)));

		if (name.endsWith("ing")) {
			variations.push(name.slice(0, -3));
			if (name[name.length - 4] === name[name.length - 5])
				variations.push(name.slice(0, -4));
		} else {
			variations.push(name + "ing", name + name[name.length - 1] + "ing");
			if (name.endsWith("y"))
				variations.push(name.slice(0, -1) + "ing");
		}

		if (name.endsWith("ion")) {
			variations.push(...getVariations(name.slice(0, -3)));
			if (name[name.length - 4] === name[name.length - 5])
				variations.push(name.slice(0, -4));
		} else
			variations.push(name + "ion");

		if (name.endsWith("er"))
			variations.push(name.slice(0, -1), name.slice(0, -2));
		else {
			variations.push(name + "r", name + "er");
			if (name.endsWith("y"))
				variations.push(name.slice(0, -1) + "ier");
		}

		if (name.endsWith("ier"))
			variations.push(name.slice(0, -3) + "y");

		variations.push(name + "s", name + "es");
		if (name.endsWith("s"))
			variations.push(name.slice(0, -1));
		else {
			if (name.endsWith("y"))
				variations.push(name.slice(0, -1) + "ies");
		}

		return variations;
	}

	export async function applyDescription (component: Component, description?: string, options?: DescriptionOptions | CharacterId) {
		component.removeContents();
		if (!description)
			return [];

		const character = typeof options === "string" ? options : options?.character;
		options = typeof options === "string" ? {} : options;
		options ??= {};
		options.character = character;
		let resolveKeywords!: (traits: DestinyTraitDefinition[]) => void;
		options.keywords = new Promise<DestinyTraitDefinition[]>(resolve => resolveKeywords = resolve);

		if (options?.singleLine)
			description = description.replace(/(\s*\n\s*)+/g, " \xa0 / \xa0 ");

		const { DestinyTraitDefinition } = await Manifest.await();
		let traits = await DestinyTraitDefinition.all() as TraitDef[];
		traits = traits.filter(trait => trait.displayProperties.name && trait.displayProperties.description);
		for (const trait of traits) {
			const name = trait.displayProperties.nameLowerCase ??= trait.displayProperties.name.toLowerCase();
			trait.displayProperties.nameLowercaseVariations ??= getVariations(name);
		}

		const split = description.split(interpolationRegex);
		if (split.length < 2) {
			const addedTraits = applyDescriptionHighlightKeywords(component, description, traits);
			options.keywords = addedTraits;
			resolveKeywords(addedTraits);
			return addedTraits;
		}

		const addedKeywords: DestinyTraitDefinition[] = [];
		const { profileStringVariables, characterStringVariables } = ProfileBatch.latest ?? {};
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
						component.text.add(section);
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
					addedKeywords.push(...applyDescriptionHighlightKeywords(component, section, traits));
			}
		}

		options.keywords = addedKeywords;
		resolveKeywords(addedKeywords);
		return options.keywords;
	}

	function applyDescriptionHighlightKeywords (component: Component, description: string, traits: TraitDef[]) {
		const addedKeywords: DestinyTraitDefinition[] = [];

		let matching = traits;
		let keyword: string | undefined = "";
		let holding = "";
		let holdingSpaceIndex: number | undefined;
		let rawSection = "";
		for (let i = 0; i < description.length; i++) {
			const char = description[i];
			if (keyword !== undefined) {
				if ((char === " " || char === "\n" || char === "(") && !keyword) {
					rawSection += char;
					continue;
				}

				holding += char;
				keyword += char.toLowerCase();
				const nextChar = description[i + 1];
				const nextCharIsWordBreak = nextChar === " " || nextChar === "\n" || nextChar === "," || nextChar === "." || nextChar === ";" || nextChar === ":" || nextChar === ")";
				const variations = getVariations(keyword);

				matching = matching.filter(trait => variations.some(keyword => trait.displayProperties.nameLowercaseVariations.some(name => name.startsWith(keyword))));
				if (!matching.length) {
					keyword = char === " " || char === "\n" || char === "(" ? "" : undefined;
					matching = traits;
					if (holdingSpaceIndex) {
						holding = holding.slice(0, -(i - holdingSpaceIndex));
						i = holdingSpaceIndex;
						keyword = "";
					}

					rawSection += holding;
					holding = "";
					holdingSpaceIndex = undefined;

				} else if (matching.length === 1 && nextCharIsWordBreak && matching[0].displayProperties.nameLowercaseVariations.some(name => variations.includes(name))) {
					addedKeywords.push(matching[0]);
					component.text.add(rawSection);
					component.append(Component.create("span")
						.classes.add("description-keyword")
						.text.set(holding[0].toUpperCase() + holding.slice(1)));
					keyword = undefined;
					holding = "";
					rawSection = "";
					matching = traits;
					holdingSpaceIndex = undefined;

				} else if (char === " ") {
					holdingSpaceIndex ??= i;
				}

			} else {
				if (char === " " || char === "\n" || char === "(") {
					keyword = "";
				}

				rawSection += char;
			}
		}

		if (rawSection)
			component.text.add(rawSection);

		return addedKeywords;
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

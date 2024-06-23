import type { DestinyDisplayPropertiesDefinition, DestinyTraitDefinition } from "bungie-api-ts/destiny2";
import Manifest from "model/models/Manifest";
import ProfileBatch from "model/models/ProfileBatch";
import type { EnumModelMapString } from "model/models/enum/EnumModelMap";
import EnumModelMap from "model/models/enum/EnumModelMap";
import type { CharacterId } from "model/models/items/Item";
import Component from "ui/component/Component";
import EnumIcon from "ui/destiny/component/EnumIcon";
import Strings from "utility/Strings";
import type { PromiseOr } from "utility/Type";

declare module "bungie-api-ts/destiny2/interfaces" {
	interface DestinyDisplayPropertiesDefinition {
		subtitle?: string;
		nameLowerCase?: string;
	}
}

export type DisplayPropertied = { readonly displayProperties: Partial<DestinyDisplayPropertiesDefinition> };
export type DisplayPropertiesOrD = DestinyDisplayPropertiesDefinition | DisplayPropertied;
export type PartialDisplayPropertiesOrD = Partial<DestinyDisplayPropertiesDefinition> | DisplayPropertied;

namespace Display {

	export const DESTINY_MANIFEST_MISSING_ICON_PATH = "/img/misc/missing_icon_d2.png";

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

	export function icon (url?: string, wrapped?: boolean, allowMissing?: boolean): string | undefined;
	export function icon (displayProperties?: PartialDisplayPropertiesOrD, wrapped?: boolean, allowMissing?: boolean): string | undefined;
	export function icon (displayProperties?: PartialDisplayPropertiesOrD | string, wrapped = true, allowMissing = false) {
		let url = displayProperties === undefined ? undefined : typeof displayProperties === "string" ? displayProperties
			: getIconURL("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties);
		if (!url)
			return undefined;

		if (url === DESTINY_MANIFEST_MISSING_ICON_PATH && !allowMissing)
			return undefined;

		if (!url.startsWith("https://") && !url.startsWith("./"))
			url = `https://www.bungie.net${url}`;
		return wrapped ? `url("${url}")` : url;
	}

	export function name (displayProperties: PartialDisplayPropertiesOrD | undefined, orElse: string): string;
	export function name (displayProperties?: PartialDisplayPropertiesOrD, orElse?: string): string | undefined;
	export function name (displayProperties?: PartialDisplayPropertiesOrD, orElse?: string) {
		return displayProperties === undefined ? orElse
			: ("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties).name
			?? orElse;
	}

	export function subtitle (displayProperties: PartialDisplayPropertiesOrD | undefined, orElse: string): string;
	export function subtitle (displayProperties?: PartialDisplayPropertiesOrD, orElse?: string): string | undefined;
	export function subtitle (displayProperties?: PartialDisplayPropertiesOrD, orElse?: string) {
		return displayProperties === undefined ? orElse
			: ("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties).subtitle
			?? orElse;
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
		traits = traits.filter(trait => trait.displayProperties.name && trait.displayProperties.description && trait.displayHint === "keyword");
		for (const trait of traits) {
			const name = trait.displayProperties.nameLowerCase ??= trait.displayProperties.name.toLowerCase();
			trait.displayProperties.nameLowercaseVariations ??= Strings.getVariations(name);
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
				const variations = Strings.getVariations(keyword);

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
						.text.set(Strings.toTitleCase(holding)));
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

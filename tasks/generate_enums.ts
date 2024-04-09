import ArrayPrototypes from "@deepsight.gg/utility/prototype/ArrayPrototypes";
import ansicolor from "ansicolor";
import type { AllDestinyManifestComponents, DestinyDisplayPropertiesDefinition, DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { DestinyItemType } from "bungie-api-ts/destiny2";
import fs from "fs-extra";
import { getDeepsightMomentDefinition } from "./manifest/DeepsightMomentDefinition";
import manifest from "./manifest/utility/endpoint/DestinyManifest";
import Env from "./utility/Env";
import Log from "./utility/Log";
import Objects from "./utility/Objects";
import Task from "./utility/Task";

ArrayPrototypes();

const MISSING_ENUM_NAMES: Partial<Record<keyof AllDestinyManifestComponents, Record<number, string>>> = {
	DestinyInventoryBucketDefinition: {
		2422292810: "Dummy",
		444348033: "Weekly Clan Objectives",
		497170007: "Weekly Clan Engrams",
		1801258597: "Highlighted Quests",
		2401704334: "Dummy Emote",
		3621873013: "Dummy",
	},
};

const OVERRIDDEN_ENUM_NAMES: Partial<Record<keyof AllDestinyManifestComponents, Record<number, string>>> = {
	DestinyItemTierTypeDefinition: {
		3772930460: "Basic Currency",
		3340296461: "Common",
		2395677314: "Uncommon",
		1801258597: "Basic Quest",
	},
};

const EXCLUDED_PATHS: Partial<Record<keyof AllDestinyManifestComponents, string[]>> = {
	DestinyInventoryItemDefinition: [
		"collectibleHash", "sockets.*", "displaySource", "perks.*",
		"traitIds.length", "traitHashes.length", "loreHash", "backgroundColor.*",
		"defaultDamageType", "defaultDamageTypeHash", "investmentStats.*", "stats.*",
		"setData.itemList*", "equippingBlock.uniqueLabelHash",
	],
	DestinyActivityDefinition: ["loadouts*", "destinationHash"],
	DestinyRecordDefinition: ["loreHash", "completionInfo.ScoreValue", "objectiveHashes*", "parentNodeHashes*"],
	DestinyVendorDefinition: ["itemList.*"],
	DestinyPresentationNodeDefinition: ["children.*"],
	DestinyDestinationDefinition: ["bubble*", "activityGraphEntries*"],
};

type ComponentHashNameGenerator =
	| keyof AllDestinyManifestComponents
	| ((definition: any) => string | undefined);

const COMPONENT_HASH_PATHS: Partial<Record<keyof AllDestinyManifestComponents, Record<string, ComponentHashNameGenerator>>> = {
	DestinyInventoryItemDefinition: {
		collectibleHash: "DestinyCollectibleDefinition",
		loreHash: "DestinyLoreDefinition",
		traitHashes: "DestinyTraitDefinition",
		"plug.plugCategoryHash": (definition: DestinyInventoryItemDefinition) => definition.plug?.plugCategoryIdentifier,
	},
	DestinyActivityDefinition: {
		destinationHash: "DestinyDestinationDefinition",
	},
	DestinyRecordDefinition: {
		loreHash: "DestinyLoreDefinition",
		objectiveHashes: "DestinyObjectiveDefinition",
		parentNodeHashes: "DestinyRecordDefinition",
	},
	DestinyDestinationDefinition: {
		placeHash: "DestinyPlaceDefinition",
		defaultFreeroamActivityHash: "DestinyActivityDefinition",
	},
};

const UNRENDERABLE_PATHS: Partial<Record<keyof AllDestinyManifestComponents, string[]>> = {
	DestinyInventoryItemDefinition: ["iconWatermark", "iconWatermarkShelved", "flavorText"],
	DestinyActivityDefinition: ["pgcrImage"],
};

const COMPONENT_NAME_GENERATORS: { [KEY in keyof AllDestinyManifestComponents]?: (definition: AllDestinyManifestComponents[KEY][number], get: (component: keyof AllDestinyManifestComponents, hash?: number) => Promise<string | undefined>) => Promise<string | undefined> | string | undefined } = {
	DestinyVendorGroupDefinition: def => def.categoryName,
	DestinyLoadoutNameDefinition: def => def.name,
	DestinyLocationDefinition: async (def, get) => Promise
		.all(([] as (Promise<string | undefined> | string | undefined)[])
			.concat(get("DestinyVendorDefinition", def.vendorHash))
			.concat((def.locationReleases ?? []).flatMap(location => ([location.displayProperties.name] as (Promise<string | undefined> | string | undefined)[])
				.concat(get("DestinyDestinationDefinition", location.destinationHash))
				.concat(get("DestinyActivityDefinition", location.activityHash)))))
		.then(locations => locations.filter(Boolean).distinct().join("$") || undefined),
	DestinyMedalTierDefinition: def => def.tierName,
	DestinyPowerCapDefinition: def => `${def.powerCap}`,
};

interface Definition {
	hash?: number;
	displayProperties?: DestinyDisplayPropertiesDefinition;
}

export class EnumHelper {

	public static simplifyName (name: string): string;
	public static simplifyName (name?: string): string | undefined;
	public static simplifyName (name?: string) {
		return name
			?.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
			.replace(/'/g, "")
			.split(/[\W_]+/g)
			.filter(word => word)
			.map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
			.join("");
	}

	private readonly encountered = new Map<string, Definition[]>();
	private readonly used: Record<string, number> = {};
	private diffIndices: Record<string, number> = {};

	public constructor (private readonly type: string) {
	}

	public async encounter (definition?: Definition | string) {
		const name = await this.resolve(definition);
		if (!name || typeof definition !== "object")
			return;

		let encountered = this.encountered.get(name);
		if (!encountered) {
			this.encountered.set(name, encountered = []);
		}

		encountered.push(definition);
	}

	public async name (definition?: Definition | string, dedupe = true, componentName?: keyof AllDestinyManifestComponents) {
		let name = await this.resolve(definition);
		if (!name)
			return name;

		if (!dedupe) {
			const encountered = !!this.encountered.get(name);
			if (encountered)
				return undefined;

			this.encountered.set(name, []);
			return name;
		}

		const encountered = this.encountered.get(name);
		if (!encountered || encountered.length === 1)
			return name;

		if (typeof definition === "object") {
			const instanceIndex = encountered.indexOf(definition);
			if (instanceIndex === -1)
				throw new Error(`Found duped definition name of a definition that was not previously encountered ${typeof definition} ${(definition)?.hash} ${name}`);
		}

		const magic = "uwu omg this code is bad lol";
		const prevIndex = this.diffIndices[name];

		let shortestSuffix: string | undefined;
		const differences = Objects.findDifferences(...encountered).sort((a, b) => a.path.localeCompare(b.path));

		NextDifference: for (let i = 0; i < differences.length; i++) {
			const difference = differences[i];
			if (difference.path === "index" || difference.path === "displayProperties.name")
				// "index" is unstable, it's some internal bungie row index thing, and exclude other paths
				continue;

			if (difference.unique.size !== encountered.length)
				continue;

			if (prevIndex !== undefined && prevIndex !== i)
				continue;

			const isExcludedPath = EXCLUDED_PATHS[componentName!]?.some(path => path.endsWith("*") ? difference.path.startsWith(path.slice(0, -1)) : path === difference.path);
			if (isExcludedPath)
				continue;

			const isUnrenderablePath = UNRENDERABLE_PATHS[componentName!]?.some(path => path.endsWith("*") ? difference.path.startsWith(path.slice(0, -1)) : path === difference.path);
			if (isUnrenderablePath && (encountered.length > 2 || !difference.unique.has("undefined")))
				continue;

			const getValueString = async (definition?: string | Definition) => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const value = Objects.path(definition, difference.path);

				const valueHashComponent = COMPONENT_HASH_PATHS[componentName!]?.[difference.path];
				return undefined
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					?? (typeof valueHashComponent !== "string" ? undefined : EnumHelper.simplifyName((await manifest[valueHashComponent].get(value) as Definition)?.displayProperties?.name))
					?? (typeof valueHashComponent !== "function" ? undefined : EnumHelper.simplifyName(valueHashComponent(definition as Definition)))
					?? this.stringifyValue(!isUnrenderablePath ? value
						: value ? "present" : undefined);
			};

			if (prevIndex === undefined) {
				const allValueStrings = new Set(await Promise.all(encountered.map(getValueString)));
				if (allValueStrings.size !== encountered.length)
					continue NextDifference;
			}

			const valueString = await getValueString(definition);

			const key = EnumHelper.simplifyName(difference.path.replace(/(?=[A-Z])/g, " "));
			const differenceString = `${key === "Hash" ? magic : `_${key}`}${valueString}`;

			if (prevIndex === i || differenceString.length < (shortestSuffix?.length ?? Infinity)) {
				shortestSuffix = differenceString;
				this.diffIndices[name] = i;
			}
		}

		if (!shortestSuffix)
			throw new Error(`Unable to find difference for ${name} (${this.type})`);

		name += shortestSuffix.replace(magic, "");

		this.used[name] = (this.used[name] ?? 0) + 1;
		return name;
	}

	public getDedupeFailures () {
		return Object.entries(this.used)
			.filter(([, count]) => count > 1)
			.map(([name, count]) => `${name}: ${count}`);
	}

	private stringifyValue (value: any) {
		if (Array.isArray(value)) {
			if (value.length === 0)
				return "ArrayLength0";

			return `Array$${value.map(v => EnumHelper.simplifyName(`${v}`)).join("$")}`;
		}

		if (value === null)
			return "Null";

		if (value === undefined)
			return "Undefined";

		if (typeof value === "object")
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			return `ObjectLength${Object.entries(value).length}`;

		if (typeof value === "string")
			return EnumHelper.simplifyName(value);

		return `${value}`.replace("-", "n");
	}

	private static async getEnumableName (type: keyof AllDestinyManifestComponents, definition?: number | Definition): Promise<string | undefined> {
		if (typeof definition === "number")
			definition = await manifest[type].get(definition) as Definition | undefined;

		if (!definition)
			return undefined;

		const name = OVERRIDDEN_ENUM_NAMES[type]?.[definition.hash!]
			?? definition.displayProperties?.name
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			?? await COMPONENT_NAME_GENERATORS[type]?.(definition as any, async (c, h) => (await EnumHelper.getEnumableName(c, h)) ?? "")
			?? MISSING_ENUM_NAMES[type]?.[definition.hash!];

		return name;
	}

	private async resolve (definition?: Definition | string) {
		if (typeof definition !== "string" && definition?.hash === undefined)
			return undefined;

		let name = typeof definition === "string" ? definition
			: await EnumHelper.getEnumableName(this.type as keyof AllDestinyManifestComponents, definition);

		name = EnumHelper.simplifyName(name);

		if (this.type === "DestinyInventoryItemDefinition") {
			const itemDef = definition as DestinyInventoryItemDefinition;
			if (itemDef.itemTypeDisplayName)
				name += EnumHelper.simplifyName(itemDef.itemTypeDisplayName);

			if (itemDef.itemType === DestinyItemType.Dummy || itemDef.itemType === DestinyItemType.None)
				name += "Dummy";

			if (itemDef.plug)
				name += "Plug";

			if (itemDef.itemType === DestinyItemType.QuestStep && itemDef.setData?.itemList.length)
				name += `_Step${itemDef.setData.itemList.findIndex(item => item.itemHash === itemDef.hash)}`;
		}

		return name;
	}
}

export default Task("generate_enums", async () => {
	const enumsTime = await fs.stat("static/manifest/Enums.d.ts").then(stats => stats.mtimeMs).catch(() => 0);
	const manifestTime = await fs.stat("static/testiny/.v").then(stats => stats.mtimeMs).catch(() => 0);
	if (enumsTime > manifestTime && !Env.ENUMS_NEED_UPDATE) {
		Log.info(ansicolor.lightGreen("Enums OK!"));
		await fs.copyFile("static/manifest/Enums.d.ts", "docs/manifest/Enums.d.ts");
		return;
	}

	const componentNames = await manifest.ALL;

	const stream = fs.createWriteStream("static/manifest/Enums.d.ts");

	const componentNamesWithoutDefinitionNames: string[] = [];
	const plugHelper = new EnumHelper("DestinyItemPlugDefinition");
	const traitIds: Record<number, string> = {};
	const dedupeFailures: string[] = [];

	const INVALID_HASH = 2166136261;

	async function generateEnum (componentName: keyof AllDestinyManifestComponents): Promise<void>;
	async function generateEnum (componentName: string, componentDefs: Record<number, any>): Promise<void>;
	async function generateEnum (componentName: string, componentDefs?: Record<number, any>) {
		let enumName: string = componentName;
		enumName = enumName.endsWith("Definition") ? enumName.slice(0, -10) : enumName;
		enumName = enumName.startsWith("Destiny") ? enumName.slice(7)
			: enumName.startsWith("Deepsight") ? enumName.slice(9)
				: enumName;
		let started = false;
		const componentData = componentDefs ?? await manifest[componentName as keyof AllDestinyManifestComponents].all();
		const enumHelper = new EnumHelper(componentName);

		for (const definition of Object.values(componentData) as Definition[]) {
			const nameSource = (componentName === "DestinyTraitDefinition" ? traitIds[definition.hash!] : undefined)
				?? definition;
			await enumHelper.encounter(nameSource);
		}

		for (const definition of Object.values(componentData) as Definition[]) {
			const nameSource = (componentName === "DestinyTraitDefinition" ? traitIds[definition.hash!] : undefined)
				?? definition;
			const name = await enumHelper.name(nameSource, undefined, componentName as keyof AllDestinyManifestComponents);
			if (!name)
				continue;

			if (!started) {
				started = true;
				stream.write(`export declare const enum ${enumName}Hashes {\n`);
				stream.write(`\tInvalid = ${INVALID_HASH},\n`);
			}

			if (definition.hash === INVALID_HASH)
				throw new Error("The manifest contains a definition keyed by the invalid hash oh god");

			stream.write(`\t${parseInt(name) ? `"${name}"` : name} = ${definition.hash},\n`);
		}

		if (started)
			stream.write("}\n\n");
		else
			componentNamesWithoutDefinitionNames.push(componentName);

		if (componentName === "DestinyInventoryItemDefinition") {
			stream.write("export declare const enum PlugCategoryHashes {\n");

			for (const definition of Object.values(componentData) as DestinyInventoryItemDefinition[]) {
				if (definition.traitIds?.length && definition.traitIds.length === definition.traitHashes?.length)
					for (let i = 0; i < definition.traitIds.length; i++)
						traitIds[definition.traitHashes[i]] = definition.traitIds[i];

				if (!definition.plug)
					continue;

				const name = await plugHelper.name(definition.plug.plugCategoryIdentifier, false);
				if (!name)
					continue;

				stream.write(`\t${parseInt(name) ? `"${name}"` : name} = ${definition.plug.plugCategoryHash},\n`);
			}

			stream.write("}\n\n");
		}

		const failures = enumHelper.getDedupeFailures();
		if (failures.length)
			dedupeFailures.push(`${componentName}:\n${failures.map(failure => `- ${failure}`).join("\n")}`);
	}

	for (const componentName of componentNames)
		if (componentName !== "DestinyTraitDefinition")
			await generateEnum(componentName);

	await generateEnum("DestinyTraitDefinition");

	const DeepsightMomentDefinition = await getDeepsightMomentDefinition();
	await generateEnum("DeepsightMomentDefinition", DeepsightMomentDefinition);

	stream.write(`/*\n * Unnameable components:\n * ${componentNamesWithoutDefinitionNames.join("\n * ")}\n */\n`);
	stream.close();

	if (!stream.writableFinished)
		await new Promise(resolve => stream.on("finish", resolve));

	delete Env.ENUMS_NEED_UPDATE;

	if (dedupeFailures.length)
		throw new Error(`Failed to dedupe the following enums:\n\n${dedupeFailures.join("\n\n")}`);

	await fs.mkdirp("docs/manifest");
	await fs.copyFile("static/manifest/Enums.d.ts", "docs/manifest/Enums.d.ts");
});

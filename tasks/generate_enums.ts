import fs from "fs-extra";
import type { AllDestinyManifestComponents, DestinyDisplayPropertiesDefinition, DestinyInventoryItemDefinition } from "../src/node_modules/bungie-api-ts/destiny2";
import { DestinyItemType } from "../src/node_modules/bungie-api-ts/destiny2";
import manifest from "./manifest/DestinyManifest";
import Objects from "./utilities/Objects";
import Task from "./utilities/Task";

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
	DestinyInventoryItemDefinition: ["collectibleHash"],
	DestinyActivityDefinition: ["loadouts"],
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
	private diffIndices: Record<string, number> = {};

	public constructor (private readonly type: string) {
	}

	public encounter (definition?: Definition | string) {
		const name = this.resolve(definition);
		if (!name || typeof definition !== "object")
			return;

		let encountered = this.encountered.get(name);
		if (!encountered) {
			this.encountered.set(name, encountered = []);
		}

		encountered.push(definition);
	}

	public name (definition?: Definition | string, dedupe = true, excludedPaths: string[] = []) {
		let name = this.resolve(definition);
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

		const magic = "uwu omg this code is bad lol";
		const prevIndex = this.diffIndices[name];

		let shortestSuffix: string | undefined;
		const differences = Objects.findDifferences(...encountered).sort((a, b) => a.path.localeCompare(b.path));
		for (let i = 0; i < differences.length; i++) {
			const difference = differences[i];
			if (difference.path === "index" || excludedPaths.includes(difference.path))
				// "index" is unstable, it's some internal bungie row index thing, and exclude other paths
				continue;

			if (difference.unique.size !== encountered.length)
				continue;

			if (prevIndex !== undefined && prevIndex !== i)
				continue;

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const value = Objects.path(definition, difference.path);
			const key = EnumHelper.simplifyName(difference.path.replace(/(?=[A-Z])/g, " "));
			const differenceString = `${key === "Hash" ? magic : `_${key}`}${this.stringifyValue(value)}`;
			if (prevIndex === i || differenceString.length < (shortestSuffix?.length ?? Infinity)) {
				shortestSuffix = differenceString;
				this.diffIndices[name] = i;
			}
		}

		if (!shortestSuffix)
			throw new Error(`Unable to find difference for ${name}`);

		name += shortestSuffix.replace(magic, "");
		return name;
	}

	private stringifyValue (value: any) {
		if (Array.isArray(value)) {
			if (value.length === 0)
				return "ArrayLength0";

			if (typeof value[0] === "object" || value.length > 5)
				return `ArrayLength${value.length}`;

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

	private resolve (definition?: Definition | string) {
		if (typeof definition !== "string" && definition?.hash === undefined)
			return undefined;

		let name = OVERRIDDEN_ENUM_NAMES[this.type as keyof AllDestinyManifestComponents]?.[(definition as Definition).hash!]
			?? (typeof definition === "string" ? definition : definition.displayProperties?.name)
			?? MISSING_ENUM_NAMES[this.type as keyof AllDestinyManifestComponents]?.[(definition as Definition).hash!];

		name = EnumHelper.simplifyName(name);
		if (!name)
			return undefined;

		if (this.type === "DestinyInventoryItemDefinition") {
			const itemDef = definition as DestinyInventoryItemDefinition;
			if (itemDef.itemTypeDisplayName)
				name += EnumHelper.simplifyName(itemDef.itemTypeDisplayName);

			if (itemDef.itemType === DestinyItemType.Dummy || (itemDef.itemType === DestinyItemType.None && this.encountered.has(name)))
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
	const componentNames = await manifest.ALL;

	const stream = fs.createWriteStream("tasks/manifest/Enums.d.ts");

	const componentNamesWithoutDefinitionNames: string[] = [];
	const plugHelper = new EnumHelper("DestinyItemPlugDefinition");
	const traitIds: Record<number, string> = {};

	async function generateEnum (componentName: keyof AllDestinyManifestComponents) {
		let enumName: string = componentName;
		enumName = enumName.endsWith("Definition") ? enumName.slice(0, -10) : enumName;
		enumName = enumName.startsWith("Destiny") ? enumName.slice(7) : enumName;
		let started = false;
		const componentData = await manifest[componentName].all();
		const enumHelper = new EnumHelper(componentName);

		for (const definition of Object.values(componentData) as Definition[]) {
			const nameSource = (componentName === "DestinyTraitDefinition" ? traitIds[definition.hash!] : undefined)
				?? definition;
			enumHelper.encounter(nameSource);
		}

		for (const definition of Object.values(componentData) as Definition[]) {
			const nameSource = (componentName === "DestinyTraitDefinition" ? traitIds[definition.hash!] : undefined)
				?? definition;
			const name = enumHelper.name(nameSource, undefined, EXCLUDED_PATHS[componentName]);
			if (!name)
				continue;

			if (!started) {
				started = true;
				stream.write(`export declare const enum ${enumName}Hashes {\n`);
			}

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

				const name = plugHelper.name(definition.plug.plugCategoryIdentifier, false);
				if (!name)
					continue;

				stream.write(`\t${parseInt(name) ? `"${name}"` : name} = ${definition.plug.plugCategoryHash},\n`);
			}

			stream.write("}\n\n");
		}
	}

	for (const componentName of componentNames)
		if (componentName !== "DestinyTraitDefinition")
			await generateEnum(componentName);

	await generateEnum("DestinyTraitDefinition");

	stream.write(`/*\n * Unnameable components:\n * ${componentNamesWithoutDefinitionNames.join("\n * ")}\n */\n`);
	stream.close();

	if (!stream.writableFinished)
		await new Promise(resolve => stream.on("finish", resolve));

	await fs.mkdirp("docs/manifest");
	await fs.copyFile("tasks/manifest/Enums.d.ts", "docs/manifest/Enums.d.ts");
});

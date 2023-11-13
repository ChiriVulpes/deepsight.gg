import fs from "fs-extra";
import type { AllDestinyManifestComponents, DestinyDisplayPropertiesDefinition, DestinyInventoryItemDefinition } from "../src/node_modules/bungie-api-ts/destiny2";
import { DestinyItemType } from "../src/node_modules/bungie-api-ts/destiny2";
import manifest from "./manifest/DestinyManifest";
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

	private readonly encounteredNames = new Set<string>();

	public constructor (private readonly type: string) {
	}

	public name (definition?: Definition | string, dedupe = true) {
		if (typeof definition !== "string" && definition?.hash === undefined)
			return undefined;

		let name = (typeof definition === "string" ? definition : definition.displayProperties?.name)
			?? MISSING_ENUM_NAMES[this.type as keyof AllDestinyManifestComponents]?.[(definition as Definition).hash!];

		name = EnumHelper.simplifyName(name);
		if (!name)
			return undefined;

		if (this.type === "DestinyInventoryItemDefinition") {
			const itemDef = definition as DestinyInventoryItemDefinition;
			if (itemDef.itemTypeDisplayName)
				name += EnumHelper.simplifyName(itemDef.itemTypeDisplayName);

			if (itemDef.itemType === DestinyItemType.Dummy || (itemDef.itemType === DestinyItemType.None && this.encounteredNames.has(name)))
				name += "Dummy";

			if (itemDef.itemType === DestinyItemType.QuestStep && itemDef.setData?.itemList.length)
				name += `_Step${itemDef.setData.itemList.findIndex(item => item.itemHash === itemDef.hash)}`;
		}

		if (!dedupe && this.encounteredNames.has(name))
			return undefined;

		const baseName = name;
		for (let i = 2; this.encounteredNames.has(name); i++)
			name = `${baseName}${i}`;

		this.encounteredNames.add(name);
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
			const name = enumHelper.name(nameSource);
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

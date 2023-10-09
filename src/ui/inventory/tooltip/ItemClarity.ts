import { DamageType, DestinyAmmunitionType, DestinyBreakerType, DestinyClass } from "bungie-api-ts/destiny2";
import AmmoTypes from "model/models/AmmoTypes";
import BreakerTypes from "model/models/BreakerTypes";
import ClassTypes from "model/models/ClassTypes";
import DamageTypes from "model/models/DamageTypes";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import EnumIcon from "ui/bungie/EnumIcon";
import Env from "utility/Env";
import Strings from "utility/Strings";
import type { ClarityDescription, ClarityDescriptionComponent, ClarityDescriptionTableCell, ClarityDescriptionTableRow, ClarityDescriptionTextComponent } from "utility/endpoint/clarity/endpoint/GetClarityDescriptions";

export enum ItemClarityClasses {
	Main = "item-plug-tooltip-clarity",
	Title = "item-plug-tooltip-clarity-title",
	TitleName = "item-plug-tooltip-clarity-title-name",
	Logo = "item-plug-tooltip-clarity-logo",
	Description = "item-plug-tooltip-clarity-description",
	Line = "item-plug-tooltip-clarity-line",
	ListItem = "item-plug-tooltip-clarity-list-item",
	Spacer = "item-plug-tooltip-clarity-spacer",
	Label = "item-plug-tooltip-clarity-label",
	LabelInline = "item-plug-tooltip-clarity-label-inline",
	Numeric = "item-plug-tooltip-clarity-numeric",
	NumericUnknown = "item-plug-tooltip-clarity-numeric-unknown",
	Estimate = "item-plug-tooltip-clarity-estimate",
	StackSizeSeparator = "item-plug-tooltip-clarity-stack-size-separator",
	EnhancedArrow = "item-plug-tooltip-clarity-enhanced-arrow",
	EnhancedLine = "item-plug-tooltip-clarity-enhanced-line",
	Table = "item-plug-tooltip-clarity-table",
	Table_IsFirstColumnAllLabels = "item-plug-tooltip-clarity-table_is-first-column-all-labels",
	TableRow = "item-plug-tooltip-clarity-table-row",
	TableCell = "item-plug-tooltip-clarity-table-cell",
	TableCellNumeric = "item-plug-tooltip-clarity-table-cell-numeric",
	TableCellText = "item-plug-tooltip-clarity-table-cell-text",
	PVE = "item-plug-tooltip-clarity-pve",
	PVP = "item-plug-tooltip-clarity-pvp",
	PVEVP = "item-plug-tooltip-clarity-pvevp",
	LabelPVEVP = "item-plug-tooltip-clarity-label-pvevp",
	LabelPVE = "item-plug-tooltip-clarity-label-pve",
	LabelPVP = "item-plug-tooltip-clarity-label-pvp",
	Definitions = "item-plug-tooltip-clarity-definitions",
	Definition = "item-plug-tooltip-clarity-definition",
	DefinitionTitle = "item-plug-tooltip-clarity-definition-title",
	DefinitionTitleIndex = "item-plug-tooltip-clarity-definition-title-index",
}

const imageDefs = {
	kinetic: [DamageTypes, DamageType.Kinetic] as const,
	arc: [DamageTypes, DamageType.Arc] as const,
	void: [DamageTypes, DamageType.Void] as const,
	solar: [DamageTypes, DamageType.Thermal] as const,
	stasis: [DamageTypes, DamageType.Stasis] as const,
	strand: [DamageTypes, DamageType.Strand] as const,
	primary: [AmmoTypes, DestinyAmmunitionType.Primary] as const,
	special: [AmmoTypes, DestinyAmmunitionType.Special] as const,
	heavy: [AmmoTypes, DestinyAmmunitionType.Heavy] as const,
	titan: [ClassTypes, DestinyClass.Titan] as const,
	hunter: [ClassTypes, DestinyClass.Hunter] as const,
	warlock: [ClassTypes, DestinyClass.Warlock] as const,
	barrier: [BreakerTypes, DestinyBreakerType.ShieldPiercing] as const,
	overload: [BreakerTypes, DestinyBreakerType.Disruption] as const,
	unstoppable: [BreakerTypes, DestinyBreakerType.Stagger] as const,
};

export default class ItemClarity extends Component {

	public description!: Component;

	public get isPresent () {
		return !this.classes.has(Classes.Hidden);
	}

	protected override onMake (): void {
		this.classes.add(ItemClarityClasses.Main);

		const title = Component.create()
			.classes.add(ItemClarityClasses.Title)
			.appendTo(this);

		Component.create("img")
			.classes.add(ItemClarityClasses.Logo)
			.attributes.set("src", "https://avatars.githubusercontent.com/u/117947315?s=48&v=4")
			.appendTo(title);

		Component.create("span")
			.classes.add(ItemClarityClasses.TitleName)
			.text.set("Clarity")
			.appendTo(title);

		title.text.add(" / Community Insights")

		this.description = Component.create()
			.appendTo(this);
	}

	public set (clarityDescription?: ClarityDescription) {
		this.classes.add(Classes.Hidden);
		this.description.removeContents();

		if (!clarityDescription?.descriptions.en?.length)
			return false;

		this.classes.remove(Classes.Hidden);
		appendClarityDescriptionComponents(this.description, clarityDescription.descriptions.en, { index: 0 });

		return true;
	}
}

export class ItemClarityDefinitions extends Component {

	public get isPresent () {
		return !this.classes.has(Classes.Hidden);
	}

	protected override onMake (): void {
		this.classes.add(ItemClarityClasses.Definitions);
	}

	public set (clarityDescription?: ClarityDescription) {
		this.classes.add(Classes.Hidden);
		this.removeContents();

		let definitions;
		// eslint-disable-next-line prefer-const
		definitions = extractDefinitions(clarityDescription?.descriptions.en);
		if (!definitions?.length)
			return false;

		// uncomment to test multiple definitions
		// definitions = [...definitions.slice(), ...definitions.slice()];

		this.classes.remove(Classes.Hidden);
		for (let i = 0; i < definitions.length; i++) {
			const definition = definitions[i];
			Component.create()
				.classes.add(ItemClarityClasses.Definition)
				.classes.add(...classNames(definition))
				.append(Component.create("p")
					.classes.add(ItemClarityClasses.DefinitionTitle)
					.append(Component.create("sup")
						.classes.add(ItemClarityClasses.DefinitionTitleIndex)
						.text.set(`${i + 1}`))
					.text.add(definition.text ?? ""))
				.tweak(appendClarityDescriptionComponents, definition.title, { index: 0 })
				.appendTo(this);
		}
	}
}

interface DefinitionIndexTracker {
	index: number;
}

function appendClarityDescriptionComponents (parent: Component, content: string | ClarityDescriptionComponent[], definitionIndex: DefinitionIndexTracker, parentClassNames?: string[]) {
	if (typeof content === "string")
		content = [{ text: content }];

	for (let i = 0; i < content.length; i++) {
		let component = content[i];
		const singleChild = component.linesContent?.length === 1 ? component.linesContent?.[0] : undefined;
		if (component.formula || singleChild?.formula)
			// can't render formulas
			continue;

		const isLast = i >= content.length - 1 || content.slice(i + 1).every(component => component.classNames?.includes("spacer") || component.formula || (component.linesContent?.length === 1 && component.linesContent[0].formula));
		const isLine = !!component.linesContent?.length;
		const isLabel = isLine && extractText(component.linesContent![component.linesContent!.length - 1]).trimEnd().endsWith(":");
		const isListItem = isLine && extractText(component.linesContent![0]).trimStart().startsWith("• ");
		const isLabelledLine = isLine && extractText(component).includes(": ");
		const isEnhancedEffect = isLine && isLast && extractText(component.linesContent![0]).trimStart().startsWith("🡅");
		const isEnhancedArrow = component.classNames?.includes("enhancedArrow") ?? false;
		const isSpacer = component.classNames?.includes("spacer") ?? false;
		const isPVE = !parentClassNames?.includes("pve") && (component.classNames?.includes("pve") || singleChild?.classNames?.includes("pve") || false);
		const isPVP = !parentClassNames?.includes("pvp") && (component.classNames?.includes("pvp") || singleChild?.classNames?.includes("pvp") || false);

		const imageDef = component.classNames?.map(className => imageDefs[className as keyof typeof imageDefs]).find(def => def);
		if (imageDef) {
			(EnumIcon.create(imageDef) as EnumIcon)
				.appendTo(parent);
			continue;
		}

		if (isPVE || isPVP)
			component = trimTextMatchingFromStart(component, "[PVE] ", "[PVP] ", "[PVE]", "[PVP]", "[PvE] ", "[PvP] ", "[PvE]", "[PvP]");

		Component.create(isLine ? "div" : isSpacer ? "br" : component.table?.length ? "div" : "span")
			.classes.toggle(isLine, ItemClarityClasses.Line)
			.classes.toggle(isListItem, ItemClarityClasses.ListItem)
			.classes.toggle(isSpacer, ItemClarityClasses.Spacer)
			.classes.toggle(isEnhancedEffect, ItemClarityClasses.EnhancedLine)
			.classes.toggle(isLabel, ItemClarityClasses.Label)
			.classes.toggle(isEnhancedArrow, ItemClarityClasses.EnhancedArrow)
			.classes.toggle(!!component.table?.length, ItemClarityClasses.Table)
			.classes.toggle(isPVE, ItemClarityClasses.PVE)
			.classes.toggle(isPVP, ItemClarityClasses.PVP)
			.classes.toggle(isPVE || isPVP, ItemClarityClasses.PVEVP)
			.classes.toggle(!!component.title, ItemClarityClasses.DefinitionTitle)
			.classes.add(...isLine ? [ItemClarityClasses.Line] : [], ...classNames(component))
			.append(!isPVE && !isPVP ? undefined : Component.create("span")
				.classes.add(ItemClarityClasses.LabelPVEVP, isPVE ? ItemClarityClasses.LabelPVE : ItemClarityClasses.LabelPVP)
				.text.set(isPVE ? "PVE" : "PVP"))
			.tweak(appendClarityText, isEnhancedArrow ? "" : component.text ?? "", component.classNames ?? [], isPVP || isPVE)
			.tweak(appendClarityDescriptionComponents, isLabelledLine ? [] : component.linesContent ?? [], definitionIndex, [...isPVE ? ["pve"] : [], ...isPVP ? ["pvp"] : []])
			.tweak(appendClarityTableRowComponents, component.table ?? [], definitionIndex)
			.tweak(appendClarityLabelledLineComponents, !isLabelledLine ? [] : component.linesContent!, definitionIndex)
			.append(!component.title ? undefined : Component.create("sup")
				.classes.add(ItemClarityClasses.DefinitionTitleIndex)
				.text.set(`${++definitionIndex.index}`))
			.appendTo(parent);
	}
}

function appendClarityTableRowComponents (parent: Component, rows: ClarityDescriptionTableRow[], definitionIndex: DefinitionIndexTracker) {
	for (let c = 0; c < (rows[0]?.rowContent.length ?? 0); c++) {
		// delete columns where all rows (which aren't the first label row) are empty or a dash
		const shouldDeleteColumn = rows.every((row, i) => {
			const columnText = extractText(row.rowContent[c].cellContent).trim();
			return !columnText || columnText === "-" || (!i && !parseFloat(columnText));
		});

		if (shouldDeleteColumn) {
			rows = rows.map((row): ClarityDescriptionTableRow => ({
				...row,
				rowContent: row.rowContent.filter((cell, i) => i !== c),
			}));
		}

		if (!c && !shouldDeleteColumn) {
			// make a note of tables where the first column of every row is a label (or empty)
			const isFirstColumnAllLabels = rows.every((row, i) => {
				const columnText = extractText(row.rowContent[c].cellContent).trim();
				return !columnText || (!parseFloat(columnText) && !nonNumericNumberRegex.test(columnText));
			});

			parent.classes.toggle(isFirstColumnAllLabels, ItemClarityClasses.Table_IsFirstColumnAllLabels);
		}
	}

	for (const row of rows) {
		Component.create()
			.classes.add(ItemClarityClasses.TableRow, ...classNames(row))
			.tweak(appendClarityTableCellComponents, row.rowContent, definitionIndex)
			.appendTo(parent);
	}
}

const empy: string[] = [];
function classNames (component: { classNames?: string[] }) {
	return Env.DEEPSIGHT_ENVIRONMENT === "dev" ? component.classNames?.map(c => `-clarity-${c}`) ?? empy : empy;
}

function appendClarityTableCellComponents (parent: Component, cells: ClarityDescriptionTableCell[], definitionIndex: DefinitionIndexTracker) {
	for (const cell of cells) {
		const cellContent = extractText(cell.cellContent).trim();
		const isNumeric = !isNaN(parseFloat(cellContent)) || nonNumericNumberRegex.test(cellContent.replace(unknownValueBracketsRegex, "?"));

		Component.create()
			.classes.add(ItemClarityClasses.TableCell, ...classNames(cell))
			.classes.toggle(isNumeric, ItemClarityClasses.TableCellNumeric)
			.classes.toggle(!isNumeric, ItemClarityClasses.TableCellText)
			.tweak(appendClarityDescriptionComponents, cellContent === "-" ? [] : cell.cellContent, definitionIndex)
			.appendTo(parent);
	}
}

/**
 * Splits description content by `: `, wrapping the label section in an element to be styled.
 * This only detects `: ` instances in the `text` property in this level. 
 * If no `: ` was detected all content is appended directly to the parent.
 */
function appendClarityLabelledLineComponents (parent: Component, content: ClarityDescriptionComponent[], definitionIndex: DefinitionIndexTracker) {
	const label: ClarityDescriptionComponent[] = [];
	const value: ClarityDescriptionComponent[] = [];
	let split = false;
	for (const component of content) {
		const sections = component.text?.split(": ");
		if (sections?.length === 2) {
			split = true;
			label.push({ ...component, text: sections[0] } as ClarityDescriptionTextComponent);
			value.push({ ...component, text: sections[1] } as ClarityDescriptionTextComponent);
		} else {
			(split ? value : label).push(component);
		}
	}

	if (!split) {
		appendClarityDescriptionComponents(parent, content, definitionIndex);
		return;
	}

	label.push({ text: ": " });
	Component.create("span")
		.classes.add(ItemClarityClasses.LabelInline)
		.tweak(appendClarityDescriptionComponents, label, definitionIndex)
		.appendTo(parent);

	appendClarityDescriptionComponents(parent, value, definitionIndex);
}

// use regular expressions to split out numbers, stack size separators `|`, and unknown values `(?)`
const numericSplitNumericStart = /(?:(?<![\w\d.!+%-])|(?<=\d(?:st|nd|rd|th)-))(?=[x+-]?[.\d])/;
const numericSplitUnknownStart = /(?<![\w\d.!+%-])(?=\?)/;
const numericSplitNumericEnd = /(?<=[\d?][%x°+]?\??)(?![\dx?%°+.])/;
const numericSplitRegex = Strings.mergeRegularExpressions("g", numericSplitNumericStart, numericSplitUnknownStart, numericSplitNumericEnd);
const stackSizeSplitRegex = /(?=\|)|(?<=\|)/g;
const unknownValueBracketsRegex = /\(\?\)|\[\?\]/g;
const nonNumericNumberRegex = /^\?$|x[\d?]|[\d?](?:th|[%°-])/;
function appendClarityText (parent: Component, text: string, classNames: string[], isPVEVP: boolean) {
	if (isPVEVP)
		// pvp numeric values sometimes are wrapped in square brackets, we don't want them
		text = Strings.extractFromSquareBrackets(text);

	text = text.replace(unknownValueBracketsRegex, "?");

	const sections = text.split(numericSplitRegex);
	for (const section of sections) {
		if (!section)
			continue;

		const parsedFloat = !isNaN(parseFloat(Strings.trimTextMatchingFromStart(section, "x")));
		const nonNumericNumber = nonNumericNumberRegex.test(section);
		if (parsedFloat || nonNumericNumber) {
			Component.create("span")
				.classes.add(ItemClarityClasses.Numeric)
				.classes.toggle(nonNumericNumber, ItemClarityClasses.NumericUnknown)
				.text.set(nonNumericNumber ? section
					: Strings.trimTextMatchingFromEnd(section, "?"))
				// sometimes numbers end in ? showing that it's an estimate, make that ? superscript
				.append(nonNumericNumber || !section.endsWith("?") ? undefined
					: Component.create("span")
						.classes.add(ItemClarityClasses.Estimate)
						.text.set("?"))
				.appendTo(parent);

			continue;
		}

		const sections = section.split(stackSizeSplitRegex);
		for (const section of sections) {
			if (section.trim() === "|") {
				Component.create("span")
					.classes.add(ItemClarityClasses.StackSizeSeparator)
					.text.set("/")
					.appendTo(parent);

				continue;
			}

			parent.text.add(section);
		}
	}
}

/**
 * Extracts text from description components.
 */
function extractText (content: ClarityDescriptionComponent | string | ClarityDescriptionComponent[]) {
	content = typeof content === "string" ? [{ text: content }] : Array.isArray(content) ? content : [content];

	let result = "";
	for (const component of content) {
		result += component.text ?? "";
		if (component.linesContent?.length)
			result += extractText(component.linesContent);
	}

	return result;
}

type ClarityDescriptionComponentWithText = ClarityDescriptionComponent & { title: string | ClarityDescriptionComponent[] };

function extractDefinitions (content?: string | ClarityDescriptionComponent[]): ClarityDescriptionComponentWithText[];
function extractDefinitions (content: ClarityDescriptionComponent | ClarityDescriptionComponent[]): ClarityDescriptionComponentWithText | ClarityDescriptionComponentWithText[];
function extractDefinitions (content?: string | ClarityDescriptionComponent | ClarityDescriptionComponent[]): ClarityDescriptionComponentWithText | ClarityDescriptionComponentWithText[] {
	if (Array.isArray(content))
		return content.flatMap(component => extractDefinitions(component.linesContent ?? component));

	return typeof content === "object" && content.text && content.title ? content as ClarityDescriptionComponentWithText : [];
}

function trimTextMatchingFromStart (content: ClarityDescriptionComponent, ...matching: string[]): ClarityDescriptionComponent;
function trimTextMatchingFromStart (content: string, ...matching: string[]): string;
function trimTextMatchingFromStart (content: undefined, ...matching: string[]): undefined;
function trimTextMatchingFromStart (content: ClarityDescriptionComponent[], ...matching: string[]): ClarityDescriptionComponent[];
function trimTextMatchingFromStart (content: ClarityDescriptionComponent | string | ClarityDescriptionComponent[], ...matching: string[]): ClarityDescriptionComponent | string | ClarityDescriptionComponent[];
function trimTextMatchingFromStart (content: ClarityDescriptionComponent | string | ClarityDescriptionComponent[] | undefined, ...matching: string[]): ClarityDescriptionComponent | string | ClarityDescriptionComponent[] | undefined {
	if (!content)
		return undefined;

	if (typeof content === "string") {
		for (const text of matching)
			content = Strings.trimTextMatchingFromStart(content, text);
		return content;
	}


	if (Array.isArray(content)) {
		content = content.slice();
		content[0] = trimTextMatchingFromStart(content[0], ...matching);
		return content;
	}

	return {
		...content,
		text: trimTextMatchingFromStart(content.text!, ...matching),
		linesContent: trimTextMatchingFromStart(content.linesContent!, ...matching),
	} as any;
}

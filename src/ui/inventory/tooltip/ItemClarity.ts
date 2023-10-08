import { ClarityManifest } from "model/models/Manifest";
import type { Plug } from "model/models/items/Plugs";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Env from "utility/Env";
import Strings from "utility/Strings";
import type { ClarityDescriptionComponent, ClarityDescriptionTableCell, ClarityDescriptionTableRow, ClarityDescriptionTextComponent } from "utility/endpoint/clarity/endpoint/GetClarityDescriptions";

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
}

export default class ItemClarity extends Component {

	public description!: Component;

	protected override onMake (): void {
		this.classes.add(ItemClarityClasses.Main, Classes.ShowIfExtraInfo);

		const title = Component.create()
			.classes.add(ItemClarityClasses.Title)
			.appendTo(this);

		Component.create("img")
			.classes.add(ItemClarityClasses.Logo)
			.attributes.set("src", "https://database-clarity.github.io/Description-editor/assets/clarityLogo-4d0d7661.png")
			.appendTo(title);

		Component.create("span")
			.classes.add(ItemClarityClasses.TitleName)
			.text.set("Clarity")
			.appendTo(title);

		this.description = Component.create()
			.appendTo(this);
	}

	private settingPlug?: Promise<void>;
	public async setPlug (plug: Plug) {
		await this.settingPlug;

		this.classes.add(Classes.Hidden);
		this.description.removeContents();

		let markPlugSet: () => void;
		this.settingPlug = new Promise(resolve => markPlugSet = resolve);

		const clarity = await ClarityManifest.await();
		const clarityDescription = await clarity.ClarityDescriptions.get(plug.plugItemHash);

		try {
			if (!clarityDescription?.descriptions.en?.length)
				return false;

			this.classes.remove(Classes.Hidden);
			console.log("Clarity description:", clarityDescription);
			appendClarityDescriptionComponents(this.description, clarityDescription.descriptions.en);

			return true;

		} finally {
			markPlugSet!();
			delete this.settingPlug;
		}
	}
}

function appendClarityDescriptionComponents (parent: Component, content: string | ClarityDescriptionComponent[], parentClassNames?: string[]) {
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
		const isLabelledLine = isListItem && extractText(component).includes(": ");
		const isEnhancedEffect = isLine && isLast && extractText(component.linesContent![0]).trimStart().startsWith("🡅");
		const isEnhancedArrow = component.classNames?.includes("enhancedArrow") ?? false;
		const isSpacer = component.classNames?.includes("spacer") ?? false;
		const isPVE = !parentClassNames?.includes("pve") && (component.classNames?.includes("pve") || singleChild?.classNames?.includes("pve") || false);
		const isPVP = !parentClassNames?.includes("pvp") && (component.classNames?.includes("pvp") || singleChild?.classNames?.includes("pvp") || false);

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
			.classes.add(...isLine ? [ItemClarityClasses.Line] : [], ...Env.DEEPSIGHT_ENVIRONMENT === "dev" ? component.classNames ?? [] : [])
			.append(!isPVE && !isPVP ? undefined : Component.create("span")
				.classes.add(ItemClarityClasses.LabelPVEVP, isPVE ? ItemClarityClasses.LabelPVE : ItemClarityClasses.LabelPVP)
				.text.set(isPVE ? "PVE" : "PVP"))
			.tweak(appendClarityText, isEnhancedArrow ? "" : component.text ?? "", component.classNames ?? [], isPVP || isPVE)
			.tweak(appendClarityDescriptionComponents, isLabelledLine ? [] : component.linesContent ?? [], [...isPVE ? ["pve"] : [], ...isPVP ? ["pvp"] : []])
			.tweak(appendClarityTableRowComponents, component.table ?? [])
			.tweak(appendClarityLabelledLineComponents, !isLabelledLine ? [] : component.linesContent!)
			.appendTo(parent);
	}
}

function appendClarityTableRowComponents (parent: Component, rows: ClarityDescriptionTableRow[]) {
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
				return !columnText || !parseFloat(columnText);
			});

			parent.classes.toggle(isFirstColumnAllLabels, ItemClarityClasses.Table_IsFirstColumnAllLabels);
		}
	}

	for (const row of rows) {
		Component.create()
			.classes.add(ItemClarityClasses.TableRow, ...Env.DEEPSIGHT_ENVIRONMENT === "dev" ? row.classNames ?? [] : [])
			.tweak(appendClarityTableCellComponents, row.rowContent)
			.appendTo(parent);
	}
}

function appendClarityTableCellComponents (parent: Component, cells: ClarityDescriptionTableCell[]) {
	for (const cell of cells) {
		const cellContent = extractText(cell.cellContent).trim();

		Component.create()
			.classes.add(ItemClarityClasses.TableCell, ...Env.DEEPSIGHT_ENVIRONMENT === "dev" ? cell.classNames ?? [] : [])
			.classes.toggle(!isNaN(parseFloat(cellContent)), ItemClarityClasses.TableCellNumeric)
			.classes.toggle(isNaN(parseFloat(cellContent)), ItemClarityClasses.TableCellText)
			.tweak(appendClarityDescriptionComponents, cellContent === "-" ? [] : cell.cellContent)
			.appendTo(parent);
	}
}

/**
 * Splits description content by `: `, wrapping the label section in an element to be styled.
 * This only detects `: ` instances in the `text` property in this level. 
 * If no `: ` was detected all content is appended directly to the parent.
 */
function appendClarityLabelledLineComponents (parent: Component, content: ClarityDescriptionComponent[]) {
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
		appendClarityDescriptionComponents(parent, content);
		return;
	}

	label.push({ text: ": " });
	Component.create("span")
		.classes.add(ItemClarityClasses.LabelInline)
		.tweak(appendClarityDescriptionComponents, label)
		.appendTo(parent);

	appendClarityDescriptionComponents(parent, value);
}

// use regular expressions to split out numbers, stack size separators `|`, and unknown values `(?)`
const numericSplitRegex = /(?<![\w\d.!+%-])(?=\?)|(?<![\d.-])(?=\d|-\d)|(?<=\d[%x+]?\??|(?<![\w\d.!+%-])\?)(?![\d%x+.?])/g;
const stackSizeSplitRegex = /(?=\|)|(?<=\|)/g;
const unknownValueSplitRegex = /(?=\(\?\))|(?<=\(\?\))/g;
function appendClarityText (parent: Component, text: string, classNames: string[], isPVEVP: boolean) {
	if (isPVEVP)
		// pvp numeric values sometimes are wrapped in square brackets, we don't want them
		text = Strings.extractFromSquareBrackets(text);

	const sections = text.split(numericSplitRegex);
	for (const section of sections) {
		if (!section)
			continue;

		if (!isNaN(parseFloat(section))) {
			Component.create("span")
				.classes.add(ItemClarityClasses.Numeric)
				.text.set(Strings.sliceTo(section, "?"))
				// sometimes numbers end in ? showing that it's an estimate, make that ? superscript
				.append(!section.endsWith("?") ? undefined : Component.create("span")
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

			const sections = section.split(unknownValueSplitRegex);
			for (const section of sections) {
				if (section === "(?)") {
					Component.create("span")
						.classes.add(ItemClarityClasses.Numeric, ItemClarityClasses.NumericUnknown)
						.text.set("?")
						.appendTo(parent);

					continue;
				}

				parent.text.add(section);
			}
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
			content = Strings.sliceAfter(content, text);
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

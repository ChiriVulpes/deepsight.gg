import { ClarityManifest } from "model/models/Manifest";
import type { Plug } from "model/models/items/Plugs";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Env from "utility/Env";
import type { ClarityDescriptionComponent } from "utility/endpoint/clarity/endpoint/GetClarityDescriptions";

export enum ItemClarityClasses {
	Main = "item-plug-tooltip-clarity",
	Title = "item-plug-tooltip-clarity-title",
	TitleName = "item-plug-tooltip-clarity-title-name",
	Logo = "item-plug-tooltip-clarity-logo",
	Description = "item-plug-tooltip-clarity-description",
	Line = "item-plug-tooltip-clarity-line",
	Label = "item-plug-tooltip-clarity-label",
	Numeric = "item-plug-tooltip-clarity-numeric",
	StackSizeSeparator = "item-plug-tooltip-clarity-stack-size-separator",
	EnhancedArrow = "item-plug-tooltip-clarity-enhanced-arrow",
	EnhancedLine = "item-plug-tooltip-clarity-enhanced-line",
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
			.attributes.set("src", "https://lh4.googleusercontent.com/luGmT38cieRR0NUIbXbrSKEtdZ6cV43JlmtwyJNex3auJDiV0LHGNhdQr_mj1HkeIyev1tsYjVOu5zUCNjlXafw=w16383")
			.appendTo(title);

		Component.create("span")
			.classes.add(ItemClarityClasses.TitleName)
			.text.set("Clarity")
			.appendTo(title);

		this.description = Component.create()
			.appendTo(this);
	}

	public async setPlug (plug: Plug) {
		this.classes.add(Classes.Hidden);
		this.description.removeContents();

		const clarity = await ClarityManifest.await();
		const clarityDescription = await clarity.ClarityDescriptions.get(plug.plugItemHash);

		if (!clarityDescription?.descriptions.en?.length)
			return false;

		this.classes.remove(Classes.Hidden);
		appendClarityDescriptionComponents(this.description, clarityDescription.descriptions.en);

		return true;
	}
}

function appendClarityDescriptionComponents (parent: Component, content: string | ClarityDescriptionComponent[]) {
	if (typeof content === "string")
		content = [{ text: content }];

	for (const component of content) {
		const isLine = !!component.linesContent?.length;
		const isLabel = isLine && extractText(component.linesContent![component.linesContent!.length - 1]).trimEnd().endsWith(":");
		const isEnhancedEffect = isLine && extractText(component.linesContent![0]).trimStart().startsWith("🡅");
		const isEnhancedArrow = component.classNames?.includes("enhancedArrow") ?? false;
		const isSpacer = component.classNames?.includes("spacer") ?? false;
		Component.create(isLine ? "div" : isSpacer ? "br" : "span")
			.classes.toggle(isLine, ItemClarityClasses.Line)
			.classes.toggle(isEnhancedEffect, ItemClarityClasses.EnhancedLine)
			.classes.toggle(isLabel, ItemClarityClasses.Label)
			.classes.toggle(isEnhancedArrow, ItemClarityClasses.EnhancedArrow)
			.classes.add(...isLine ? [ItemClarityClasses.Line] : [], ...Env.DEEPSIGHT_ENVIRONMENT === "dev" ? component.classNames ?? [] : [])
			.tweak(appendClarityText, isEnhancedArrow ? "" : component.text ?? "", component.classNames ?? [])
			.tweak(appendClarityDescriptionComponents, component.linesContent ?? [])
			.appendTo(parent);
	}
}

const numericSplitRegex = /(?<![\d.])(?=\d)|(?<=[\d%x+])(?![\d%x+.])/g;
const stackSizeSplitRegex = /(?=\|)|(?<=\|)/g;
function appendClarityText (parent: Component, text: string, classNames: string[]) {
	const sections = text.split(numericSplitRegex);
	for (const section of sections) {
		if (!section)
			continue;

		if (isNaN(parseFloat(section))) {
			const sections = section.split(stackSizeSplitRegex);
			for (const section of sections) {
				if (section.trim() === "|")
					Component.create("span")
						.classes.add(ItemClarityClasses.StackSizeSeparator)
						.text.set("/")
						.appendTo(parent);
				else
					parent.text.add(section);
			}
			continue;
		}

		Component.create("span")
			.classes.add(ItemClarityClasses.Numeric)
			.text.set(section)
			.appendTo(parent);
	}
}

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

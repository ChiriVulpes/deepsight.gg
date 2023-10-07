import { ClarityManifest } from "model/models/Manifest";
import type { Plug } from "model/models/items/Plugs";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import type { ClarityDescriptionComponent } from "utility/endpoint/clarity/endpoint/GetClarityDescriptions";

export enum ItemClarityClasses {
	Main = "item-plug-tooltip-clarity",
	Title = "item-plug-tooltip-clarity-title",
	TitleName = "item-plug-tooltip-clarity-title-name",
	Logo = "item-plug-tooltip-clarity-logo",
	Description = "item-plug-tooltip-clarity-description",
	Line = "item-plug-tooltip-clarity-line",
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
		addClarityDescriptionComponents(this.description, clarityDescription.descriptions.en);

		return true;
	}
}

function addClarityDescriptionComponents (parent: Component, content: string | ClarityDescriptionComponent[]) {
	if (typeof content === "string")
		return Component.create("span")
			.text.set(content)
			.appendTo(parent);

	for (const component of content) {
		Component.create(component.linesContent?.length ? "div" : component.classNames?.includes("spacer") ? "br" : "span")
			.classes.add(...component.linesContent?.length ? [ItemClarityClasses.Line] : [], ...component.classNames ?? [])
			.text.set(component.text ?? "")
			.tweak(addClarityDescriptionComponents, component.linesContent ?? [])
			.appendTo(parent);
	}
}

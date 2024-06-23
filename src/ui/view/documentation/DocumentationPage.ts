import Component from "ui/component/Component";
import DocumentationSection from "ui/view/documentation/DocumentationSection";

export enum DocumentationPageClasses {
	Main = "documentation-page",
	Nav = "documentation-page-nav",
	NavHeading = "documentation-page-nav-heading",
	NavLink = "documentation-page-nav-link",
}

export default class DocumentationPage extends DocumentationSection {

	public nav!: Component;

	public override onMake (): void {
		this.classes.add(DocumentationPageClasses.Main);

		this.nav = Component.create("nav")
			.classes.add(DocumentationPageClasses.Nav)
			.appendTo(this);

		super.onMake();
	}

	public regenerateNav () {
		this.nav.removeContents();
		this.generateSectionNav(this, this.nav);
	}

	private generateSectionNav (section: DocumentationSection, into: Component) {
		for (const content of section.content) {
			if (content instanceof DocumentationSection) {
				const thisContentInto = !content.title ? into : Component.create("nav")
					.classes.add(DocumentationPageClasses.Nav)
					.append(Component.create("h3")
						.classes.add(DocumentationPageClasses.NavHeading)
						.text.set(content.title))
					.appendTo(into);

				this.generateSectionNav(content, thisContentInto);
			} else {
				Component.create("button")
					.classes.add(DocumentationPageClasses.NavLink)
					.text.set(content.heading.text.get() ?? undefined)
					.appendTo(into);
			}
		}
	}
}

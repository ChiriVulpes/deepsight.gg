import Component from "ui/Component";
import DocumentationCard from "ui/view/documentation/DocumentationCard";

export enum DocumentationSectionClasses {
	Main = "documentation-section",
	Heading = "documentation-section-heading",
}

export default class DocumentationSection extends Component {

	public content!: (DocumentationCard | DocumentationSection)[];
	public title?: string;

	public override onMake () {
		this.classes.add(DocumentationSectionClasses.Main);
		this.content = [];
	}

	public setTitle (title: string) {
		this.title = title;
		Component.create("h2")
			.classes.add(DocumentationSectionClasses.Heading)
			.text.set(title)
			.prependTo(this);
		return this;
	}

	public addSection (initialiser: (section: DocumentationSection) => any) {
		this.content.push(DocumentationSection.create()
			.tweak(initialiser)
			.appendTo(this));
		return this;
	}

	public addCard (initialiser: (card: DocumentationCard) => any) {
		this.content.push(DocumentationCard.create()
			.tweak(initialiser)
			.appendTo(this));
		return this;
	}
}

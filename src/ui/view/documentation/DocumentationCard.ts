import Component from "ui/Component";
import List from "ui/List";

export enum DocumentationCardClasses {
	Main = "documentation-card",
	Heading = "documentation-card-heading",
	Content = "documentation-card-content",
	Image = "documentation-card-image",
	Imagery = "documentation-card-imagery",
	ContentParagraph = "documentation-card-content-paragraph",
	List = "documentation-card-content-list",
}

export default class DocumentationCard extends Component {

	public heading!: Component<HTMLHeadingElement>;
	public content!: Component;
	public imagery?: Component;

	protected override onMake (): void {
		this.classes.add(DocumentationCardClasses.Main);

		this.heading = Component.create("h3")
			.classes.add(DocumentationCardClasses.Heading)
			.appendTo(this);

		this.content = Component.create()
			.classes.add(DocumentationCardClasses.Content)
			.appendTo(this);
	}

	public setTitle (title: string) {
		this.heading.text.set(title);
		return this;
	}

	public addImage (image: string) {
		this.imagery ??= Component.create()
			.classes.add(DocumentationCardClasses.Imagery)
			.appendTo(this);

		Component.create("img")
			.classes.add(DocumentationCardClasses.Image)
			.attributes.set("src", image)
			// .attributes.set("loading", "lazy")
			.appendTo(this.imagery);

		return this;
	}

	public addParagraph (content: string) {
		Component.create("p")
			.classes.add(DocumentationCardClasses.ContentParagraph)
			.text.set(content)
			.appendTo(this.content);
		return this;
	}

	public addList (initialiser: (list: List.Unordered) => any) {
		List.Unordered.create()
			.classes.add(DocumentationCardClasses.List)
			.tweak(initialiser)
			.appendTo(this.content);
		return this;
	}
}
import Component from "ui/Component";

export enum CardClasses {
	Main = "card",
	Header = "card-header",
	Title = "card-title",
	Icon = "card-icon",
	Content = "card-content",
}

export default class Card<ARGS extends readonly any[] = readonly any[]> extends Component<HTMLElement, ARGS> {

	public header!: Component;
	public title!: Component;
	private _icon?: Component;
	public content!: Component;

	public get icon () {
		return this._icon ??= Component.create()
			.classes.add(CardClasses.Icon)
			.appendTo(this.title);
	}

	protected override onMake (...args: ARGS) {
		this.classes.add(CardClasses.Main);

		this.header = Component.create()
			.classes.add(CardClasses.Header)
			.appendTo(this);

		this.title = Component.create()
			.classes.add(CardClasses.Title)
			.appendTo(this.header);

		this.content = Component.create()
			.classes.add(CardClasses.Content)
			.appendTo(this);
	}
}

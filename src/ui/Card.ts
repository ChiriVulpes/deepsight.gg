import Component from "ui/Component";

export enum CardClasses {
	Main = "card",
	Header = "card-header",
	Title = "card-title",
	TitleButton = "card-title-button",
	Icon = "card-icon",
	Content = "card-content",
	DisplayModeBlock = "card-block",
	DisplayModeBlockHeader = "card-block-header",
	DisplayModeBlockTitle = "card-block-title",
	DisplayModeBlockTitleButton = "card-block-title-button",
	DisplayModeBlockIcon = "card-block-icon",
	DisplayModeBlockContent = "card-block-content",
	DisplayModeSection = "card-section",
	DisplayModeSectionHeader = "card-section-header",
	DisplayModeSectionTitle = "card-section-title",
	DisplayModeSectionTitleButton = "card-section-title-button",
	DisplayModeSectionIcon = "card-section-icon",
	DisplayModeSectionContent = "card-section-content",
}

export default class Card<ARGS extends readonly any[] = readonly any[]> extends Component<HTMLElement, ARGS> {

	public header!: Component;
	public title!: Component;
	private _icon?: Component;
	public content!: Component;

	public get icon () {
		return this._icon ??= Component.create()
			.classes.add(CardClasses.Icon)
			.classes.add(this.classes.has(CardClasses.DisplayModeBlock) ? CardClasses.DisplayModeBlockIcon : CardClasses.DisplayModeSectionIcon)
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

		this.setDisplayMode(CardClasses.DisplayModeBlock);
	}

	public setDisplayMode (displayMode: CardClasses.DisplayModeBlock | CardClasses.DisplayModeSection) {
		this.classes.remove(CardClasses.DisplayModeBlock, CardClasses.DisplayModeSection);
		this.header.classes.remove(CardClasses.DisplayModeBlockHeader, CardClasses.DisplayModeSectionHeader);
		this.title.classes.remove(CardClasses.DisplayModeBlockTitle, CardClasses.DisplayModeSectionTitle);
		this.content.classes.remove(CardClasses.DisplayModeBlockContent, CardClasses.DisplayModeSectionContent);
		this._icon?.classes.remove(CardClasses.DisplayModeBlockIcon, CardClasses.DisplayModeSectionIcon);
		const titleButtons = [...this.title.children()].filter(child => child.classes.has(CardClasses.TitleButton));
		titleButtons.forEach(button => button.classes.remove(CardClasses.DisplayModeBlockTitleButton, CardClasses.DisplayModeSectionTitleButton));
		this.classes.add(displayMode);
		this.header.classes.add(`${displayMode}-header`);
		this.title.classes.add(`${displayMode}-title`);
		this.content.classes.add(`${displayMode}-content`);
		this._icon?.classes.add(`${displayMode}-icon`);
		titleButtons.forEach(button => button.classes.add(`${displayMode}-title-button`));
	}

}

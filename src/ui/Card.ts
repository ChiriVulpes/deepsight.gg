import Component from "ui/Component";

export enum CardClasses {
	Main = "card",
	Header = "card-header",
	Title = "card-title",
	TitleButton = "card-title-button",
	Icon = "card-icon",
	Background = "card-background",
	BackgroundWrapper = "card-background-wrapper",
	Content = "card-content",
	ContentWrapper = "card-content-wrapper",
	DisplayModeBlock = "card-block",
	DisplayModeBlockHeader = "card-block-header",
	DisplayModeBlockTitle = "card-block-title",
	DisplayModeBlockTitleButton = "card-block-title-button",
	DisplayModeBlockIcon = "card-block-icon",
	DisplayModeBlockBackground = "card-block-background",
	DisplayModeBlockBackgroundWrapper = "card-block-background-wrapper",
	DisplayModeBlockContent = "card-block-content",
	DisplayModeBlockContentWrapper = "card-block-content-wrapper",
	DisplayModeSection = "card-section",
	DisplayModeSectionHeader = "card-section-header",
	DisplayModeSectionTitle = "card-section-title",
	DisplayModeSectionTitleButton = "card-section-title-button",
	DisplayModeSectionIcon = "card-section-icon",
	DisplayModeSectionBackground = "card-section-background",
	DisplayModeSectionBackgroundWrapper = "card-section-background-wrapper",
	DisplayModeSectionContent = "card-section-content",
	DisplayModeSectionContentWrapper = "card-section-content-wrapper",
	DisplayModeCard = "card-card",
	DisplayModeCardHeader = "card-card-header",
	DisplayModeCardTitle = "card-card-title",
	DisplayModeCardTitleButton = "card-card-title-button",
	DisplayModeCardIcon = "card-card-icon",
	DisplayModeCardBackground = "card-card-background",
	DisplayModeCardBackgroundWrapper = "card-card-background-wrapper",
	DisplayModeCardContent = "card-card-content",
	DisplayModeCardContentWrapper = "card-card-content-wrapper",
}

const displayModes = [
	CardClasses.DisplayModeBlock,
	CardClasses.DisplayModeSection,
	CardClasses.DisplayModeCard,
] as const;

export type CardDisplayMode = (typeof displayModes)[number];

export default class Card<ARGS extends readonly any[] = readonly any[]> extends Component<HTMLElement, ARGS> {

	public static readonly DISPLAY_MODES = displayModes;

	public header!: Component;
	public title!: Component;
	private _icon?: Component;
	private _background?: Component;
	private _backgroundWrapper?: Component;
	public contentWrapper!: Component;
	public content!: Component;

	/**
	 * Only supports DisplayModeBlock and DisplayModeSection atm
	 */
	public get icon () {
		if (this._icon?.element.parentElement !== this.title.element)
			delete this._icon;

		return this._icon ??= Component.create()
			.classes.add(CardClasses.Icon, `${this.getDisplayMode()}-icon` satisfies `${CardClasses}`)
			.appendTo(this.title);
	}

	/**
	 * Only supports DisplayModeCard atm
	 */
	public get background () {
		return this._background ??= Component.create("img")
			.classes.add(CardClasses.Background, `${this.getDisplayMode()}-background` satisfies `${CardClasses}`)
			.appendTo(this._backgroundWrapper = Component.create()
				.classes.add(CardClasses.BackgroundWrapper, `${this.getDisplayMode()}-background-wrapper` satisfies `${CardClasses}`)
				.prependTo(this));
	}

	protected override onMake (...args: ARGS) {
		this.classes.add(CardClasses.Main);

		this.header = Component.create()
			.classes.add(CardClasses.Header)
			.appendTo(this);

		this.title = Component.create()
			.classes.add(CardClasses.Title)
			.appendTo(this.header);

		this.contentWrapper = Component.create()
			.classes.add(CardClasses.ContentWrapper)
			.appendTo(this);

		this.content = Component.create()
			.classes.add(CardClasses.Content)
			.appendTo(this.contentWrapper);

		this.setDisplayMode(CardClasses.DisplayModeBlock);
	}

	public getDisplayMode (): CardDisplayMode {
		const result = this.classes.has(CardClasses.DisplayModeBlock) ? CardClasses.DisplayModeBlock
			: this.classes.has(CardClasses.DisplayModeCard) ? CardClasses.DisplayModeCard
				: this.classes.has(CardClasses.DisplayModeSection) ? CardClasses.DisplayModeSection
					: undefined;

		if (!result)
			throw new Error("Card has no display mode");

		return result;
	}

	public setDisplayMode (displayMode: CardDisplayMode) {
		const titleButtons = [...this.title.children()].filter(child => child.classes.has(CardClasses.TitleButton));

		for (const displayMode of displayModes) {
			this.classes.remove(displayMode);
			this.header.classes.remove(`${displayMode}-header` satisfies `${CardClasses}`);
			this.title.classes.remove(`${displayMode}-title` satisfies `${CardClasses}`);
			this.content.classes.remove(`${displayMode}-content` satisfies `${CardClasses}`);
			this.contentWrapper.classes.remove(`${displayMode}-content-wrapper` satisfies `${CardClasses}`);
			this._icon?.classes.remove(`${displayMode}-icon` satisfies `${CardClasses}`);
			this._background?.classes.remove(`${displayMode}-background` satisfies `${CardClasses}`);
			this._backgroundWrapper?.classes.remove(`${displayMode}-background-wrapper` satisfies `${CardClasses}`);
			titleButtons.forEach(button => button.classes.remove(`${displayMode}-title-button` satisfies `${CardClasses}`));
		}

		this.classes.add(displayMode);
		this.header.classes.add(`${displayMode}-header` satisfies `${CardClasses}`);
		this.title.classes.add(`${displayMode}-title` satisfies `${CardClasses}`);
		this.content.classes.add(`${displayMode}-content` satisfies `${CardClasses}`);
		this.contentWrapper.classes.add(`${displayMode}-content-wrapper` satisfies `${CardClasses}`);
		this._icon?.classes.add(`${displayMode}-icon` satisfies `${CardClasses}`);
		this._background?.classes.add(`${displayMode}-background` satisfies `${CardClasses}`);
		this._backgroundWrapper?.classes.add(`${displayMode}-background-wrapper` satisfies `${CardClasses}`);
		titleButtons.forEach(button => button.classes.add(`${displayMode}-title-button` satisfies `${CardClasses}`));

		return this;
	}

}

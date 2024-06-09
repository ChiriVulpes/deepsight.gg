import Component from "ui/Component";
import Button from "ui/form/Button";
import Maths from "utility/maths/Maths";

export enum PaginatorClasses {
	Main = "paginator",
	PageWrapper = "paginator-page-wrapper",
	Page = "paginator-page",
	PageHasNext = "paginator-page-has-next",
	PageHasPrev = "paginator-page-has-prev",
	Button = "paginator-button",
	ButtonNext = "paginator-button-next",
	ButtonPrev = "paginator-button-prev",
	ButtonArrow = "paginator-button-arrow",
	ButtonArrowNext = "paginator-button-arrow-next",
	ButtonArrowPrev = "paginator-button-arrow-prev",
	Preview = "paginator-preview",
	PreviewPage = "paginator-preview-page",
	PreviewPageCurrent = "paginator-preview-page-current",
	_DisplayMode = "paginator--display-mode-",
	_DisplayModeSides = "paginator--display-mode-sides",
	_DisplayModeTop = "paginator--display-mode-top",
}

export interface PaginatorFiller {
	perPage: number | PaginatorSizeHelper;
	/**
	 * Returns the current page that components should be appended to, creating new pages when necessary.
	 */
	increment (pageInitialiser?: (page: PaginatorPage) => any): PaginatorPage;
	/**
	 * Returns the current page that components should be appended to, creating new pages when necessary.
	 */
	add (value: number, pageInitialiser?: (page: PaginatorPage) => any): PaginatorPage;
	/**
	 * Accepts a function that will append one additional item. If a number is returned, that number of items is appended instead.
	 */
	fillRemainder (appender: (page: PaginatorPage) => any): void;
}

export interface PaginatorSizeHelper {
	desktop?: number;
	vertical?: number;
	tablet?: number;
	mobile?: number;
}

export namespace PaginatorSizeHelper {
	export function make (helper: PaginatorSizeHelper) {
		return helper;
	}

	export function getPerPage (helper: number | PaginatorSizeHelper) {
		if (typeof helper === "number")
			return helper;

		if (Component.window.width > 1200)
			return helper.desktop ?? helper.vertical ?? helper.tablet ?? helper.mobile ?? 1;

		if (Component.window.width >= 1080)
			return helper.vertical ?? helper.tablet ?? helper.mobile ?? helper.desktop ?? 1;

		if (Component.window.width > 800)
			return helper.tablet ?? helper.mobile ?? helper.vertical ?? helper.desktop ?? 1;

		return helper.mobile ?? helper.tablet ?? helper.vertical ?? helper.desktop ?? 1;
	}
}

export default class Paginator extends Component {

	public pageWrapper!: Component;
	public buttonPrev!: Button;
	public buttonNext!: Button;
	public pages!: PaginatorPage[];
	public pageIndex!: number;
	public preview!: Component;
	public previewPages!: Component[];

	protected override onMake (): void {
		this.classes.add(PaginatorClasses.Main);
		this.pages = [];
		this.previewPages = [];
		this.pageIndex = 0;

		this.buttonPrev = Button.create()
			.classes.add(PaginatorClasses.Button, PaginatorClasses.ButtonPrev)
			.setPrimary()
			.append(Component.create()
				.classes.add(PaginatorClasses.ButtonArrow, PaginatorClasses.ButtonArrowPrev))
			.event.subscribe("click", () => this.showPage(this.pageIndex - 1))
			.appendTo(this);

		this.pageWrapper = Component.create()
			.classes.add(PaginatorClasses.PageWrapper)
			.appendTo(this);

		this.buttonNext = Button.create()
			.classes.add(PaginatorClasses.Button, PaginatorClasses.ButtonNext)
			.setPrimary()
			.append(Component.create()
				.classes.add(PaginatorClasses.ButtonArrow, PaginatorClasses.ButtonArrowNext))
			.event.subscribe("click", () => this.showPage(this.pageIndex + 1))
			.appendTo(this);

		this.preview = Component.create()
			.classes.add(PaginatorClasses.Preview)
			.appendTo(this);

		this.event.subscribe("wheel", event => event.shiftKey
			&& this.showPage(this.pageIndex + Math.sign(event.deltaY))
			&& event.preventDefault());
		this.event.subscribe("mousedown", event => {
			if (event.button === 1) {
				event.preventDefault();
				event.stopImmediatePropagation();
			}
		});
	}

	public setDisplayMode (mode: "sides" | "top") {
		this.classes.remove(PaginatorClasses._DisplayModeSides, PaginatorClasses._DisplayModeTop);
		this.classes.add(`${PaginatorClasses._DisplayMode}${mode}`);
		return this;
	}

	public filler (perPage: number | PaginatorSizeHelper, pageInitialiser?: (page: PaginatorPage) => any): PaginatorFiller {
		if (this.pages.length)
			// store old pages in a way that will get yeeted by GC
			Component.create()
				.append(...this.pages);

		for (const previewPage of this.previewPages)
			previewPage.remove();

		this.pages.length = 0;
		this.previewPages.length = 0;
		this.pageIndex = 0;
		this.pageWrapper.element.scrollLeft = 0;
		this.scrolling = false;

		let page: PaginatorPage | undefined;
		let filled = Infinity;
		const result: PaginatorFiller = {
			perPage,
			increment: incrementPageInitialiser => {
				return result.add(1, incrementPageInitialiser);
			},
			add: (value, incrementPageInitialiser) => {
				const perPage = PaginatorSizeHelper.getPerPage(result.perPage);
				if (filled + value > perPage && !(value >= perPage && !filled))
					filled = 0, page = this.page()
						.tweak(pageInitialiser)
						.tweak(incrementPageInitialiser)
						.style.set("--paginator-page-size", `${perPage}`);

				filled += value;
				return page!;
			},
			fillRemainder (appender) {
				const perPage = PaginatorSizeHelper.getPerPage(result.perPage);
				while (filled < perPage && filled !== 0) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const count = appender(result.increment());
					if (typeof count === "number")
						filled += count - 1;
				}
			},
		};
		return result;
	}

	public page (initialiser: (page: Component) => void): this;
	public page (): PaginatorPage;
	public page (initialiser?: (page: Component) => void): this | PaginatorPage {
		const index = this.pages.length;

		const page = PaginatorPage.create([index])
			.classes.add(PaginatorClasses.Page)
			.tweak(initialiser)
			.appendTo(this.pageWrapper);
		this.pages.push(page);

		const preview = Component.create()
			.classes.add(PaginatorClasses.PreviewPage)
			.classes.toggle(!index, PaginatorClasses.PreviewPageCurrent)
			.appendTo(this.preview);
		this.previewPages.push(preview);

		this.updateButtons();
		return initialiser ? this : page;
	}

	public showPage (pageIndex: number) {
		const page = this.pages[pageIndex];
		if (!page)
			return false;

		this.pageIndex = pageIndex;
		this.scroll();

		for (const page of this.previewPages)
			page.classes.remove(PaginatorClasses.PreviewPageCurrent);

		this.previewPages[pageIndex]?.classes.add(PaginatorClasses.PreviewPageCurrent);
		this.updateButtons();
		return true;
	}

	private updateButtons () {
		this.buttonPrev.setDisabled(this.pageIndex === 0);
		this.buttonNext.setDisabled(this.pageIndex === this.pages.length - 1);
	}

	private scrolling = false;
	private scroll () {
		if (this.scrolling)
			return;

		this.scrolling = true;
		let lastStep = Date.now();
		const tickRate = 1000 / 30;
		const scrollSpeed = 1 / 3;
		const step = () => {
			if (!this.scrolling)
				return;

			const now = Date.now();
			const delta = (now - lastStep) / tickRate;
			lastStep = now;

			const paddingleft = 0;

			const pageElement = this.pages[this.pageIndex].element;
			const wrapperElement = this.pageWrapper.element;
			const offsetLeft = pageElement.offsetLeft - wrapperElement.offsetLeft + paddingleft;
			const scrollLeft = wrapperElement.scrollLeft;

			const targetScrollLeft = offsetLeft - paddingleft;

			const diff = targetScrollLeft - scrollLeft;
			if (Math.abs(diff) > 2) {
				const newScrollLeft = Maths.lerp(targetScrollLeft, scrollLeft, 0.5 ** (delta * scrollSpeed));
				const scrollDiff = newScrollLeft - scrollLeft;
				this.pageWrapper.element.scrollLeft = scrollDiff > 0 ? Math.ceil(newScrollLeft) : Math.floor(newScrollLeft);
				requestAnimationFrame(step);
				return;
			}

			this.pageWrapper.element.scrollLeft = targetScrollLeft;
			this.scrolling = false;
		};

		requestAnimationFrame(step);
	}
}

export class PaginatorPage extends Component<HTMLElement, [page: number]> {

	public page!: number;

	protected override onMake (page: number): void {
		this.classes.add(PaginatorClasses.Page);
		this.page = page;
	}
}

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
}

export interface PaginatorFiller {
	perPage: number;
	/**
	 * Returns the current page that components should be appended to, creating new pages when necessary.
	 */
	increment (pageInitialiser?: (page: PaginatorPage) => any): PaginatorPage;
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
	}

	public filler (perPage: number, pageInitialiser?: (page: PaginatorPage) => any): PaginatorFiller {
		let page: PaginatorPage | undefined;
		let index = 0;
		const result: PaginatorFiller = {
			perPage,
			increment: incrementPageInitialiser => {
				page ??= this.page()
					.tweak(pageInitialiser)
					.tweak(incrementPageInitialiser)
					.style.set("--paginator-page-size", `${perPage}`);

				index++;
				if (index <= perPage)
					return page;

				page = this.page()
					.tweak(pageInitialiser)
					.tweak(incrementPageInitialiser)
					.style.set("--paginator-page-size", `${perPage}`);
				index = 0;
				return page;
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
			const now = Date.now();
			const delta = (now - lastStep) / tickRate;
			lastStep = now;

			const paddingleft = 0;

			const pageElement = this.pages[this.pageIndex].element;
			const wrapperElement = this.pageWrapper.element;
			const offsetLeft = pageElement.offsetLeft - wrapperElement.offsetLeft + paddingleft;
			const scrollLeft = wrapperElement.scrollLeft;

			const diff = offsetLeft - scrollLeft;
			if (Math.abs(diff) > 2) {
				this.pageWrapper.element.scrollLeft = Maths.lerp(offsetLeft - paddingleft, scrollLeft, 0.5 ** (delta * scrollSpeed));
				requestAnimationFrame(step);
				return;
			}

			this.pageWrapper.element.scrollLeft = offsetLeft - paddingleft;
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

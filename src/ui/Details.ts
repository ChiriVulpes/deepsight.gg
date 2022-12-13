import Component from "ui/Component";
import Button from "ui/form/Button";

export enum DetailsClasses {
	Main = "details",
	Summary = "summary",
}

export default class Details<ARGS extends readonly any[] = []> extends Component<HTMLDetailsElement, ARGS> {

	protected static override defaultType = "details";

	public summary!: Button;

	protected override onMake (...args: ARGS): void {
		super.onMake(...args);
		this.classes.add(DetailsClasses.Main);

		this.summary = Button.create("summary")
			.classes.add(DetailsClasses.Summary)
			.appendTo(this);
	}

	public isOpen () {
		return this.element.open;
	}

	public open () {
		this.element.open = true;
		return this;
	}

	public close () {
		this.element.open = false;
		return this;
	}

	public toggle (open?: boolean) {
		this.element.open = open === undefined ? !this.element.open : open;
		return this;
	}

	public override removeContents (): this {
		while (this.element.lastChild && this.element.lastChild !== this.summary.element)
			this.element.lastChild?.remove();
		return this;
	}
}

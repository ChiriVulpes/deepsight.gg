import Component from "ui/Component";
import Button from "ui/form/Button";

export enum DetailsClasses {
	Main = "details",
	Summary = "details-summary",
	Open = "details-open",
	Closed = "details-closed",
}

export default class Details<ARGS extends readonly any[] = []> extends Component<HTMLDetailsElement, ARGS> {

	public summary!: Button;

	protected override onMake (...args: ARGS): void {
		super.onMake(...args);
		this.classes.add(DetailsClasses.Main, DetailsClasses.Closed);

		this.summary = Button.create("summary")
			.classes.add(DetailsClasses.Summary)
			.event.subscribe("click", () => this.toggle())
			.appendTo(this);
	}

	public isOpen () {
		return !this.classes.has(DetailsClasses.Closed);
	}

	public open () {
		this.classes.remove(DetailsClasses.Closed);
		this.event.emit("toggle");
		return this;
	}

	public close () {
		this.classes.add(DetailsClasses.Closed);
		this.event.emit("toggle");
		return this;
	}

	public toggle (open?: boolean) {
		if (open === undefined || !this.classes.has(DetailsClasses.Closed) !== open) {
			this.classes.toggle(DetailsClasses.Closed);
			this.event.emit("toggle");
		}

		return this;
	}

	public override removeContents (): this {
		while (this.element.lastChild && this.element.lastChild !== this.summary.element)
			this.element.lastChild?.remove();
		return this;
	}
}

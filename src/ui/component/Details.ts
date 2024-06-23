import Button from "ui/component/Button";
import Component from "ui/component/Component";

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
		for (const child of this.element.children)
			child.removeAttribute("inert");

		this.event.emit("toggle");
		return this;
	}

	public close () {
		this.classes.add(DetailsClasses.Closed);
		for (const child of this.element.children)
			if (child !== this.summary.element)
				child.setAttribute("inert", "");
		this.event.emit("toggle");
		return this;
	}

	public toggle (open?: boolean) {
		const isOpen = !this.classes.has(DetailsClasses.Closed);
		if (open !== undefined && isOpen === open)
			return this;

		open = open === undefined ? !isOpen : open;
		return open ? this.open() : this.close();
	}

	public override removeContents (): this {
		while (this.element.lastChild && this.element.lastChild !== this.summary.element)
			this.element.lastChild?.remove();
		return this;
	}
}

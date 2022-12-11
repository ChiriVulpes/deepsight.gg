import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Button from "ui/form/Button";

export enum DrawerClasses {
	Main = "drawer",
	Panel = "drawer-panel",
	Close = "drawer-close",
}

export default class Drawer extends Component {

	private panels!: Set<Component>;
	private openReasons!: Set<string>;
	public closeButton!: Button;

	protected override onMake (): void {
		this.panels = new Set();
		this.openReasons = new Set();

		this.classes.add(DrawerClasses.Main, Classes.Hidden)
			.attributes.add("inert")
			.attributes.set("tabindex", "0")
			.event.subscribe("mousedown", event => {
				if (!(event.target as HTMLElement).closest("button, input")) {
					window.getSelection()?.removeAllRanges();
					// focus the drawer 
					this.element.focus();
					this.open("click");
					this.event.emit("focus", new FocusEvent("focus"));
				}
			});

		this.closeButton = Button.create()
			.classes.add(DrawerClasses.Close)
			.event.subscribe("mousedown", () => this.close(true))
			.event.subscribe("click", () => this.close(true))
			.appendTo(this);
	}

	public isOpen () {
		return !this.classes.has(Classes.Hidden);
	}

	public createPanel () {
		const panel = Component.create()
			.classes.add(DrawerClasses.Panel)
			.appendTo(this);

		this.panels.add(panel);
		if (this.panels.size > 1)
			panel.classes.add(Classes.Hidden)
				.attributes.add("inert");

		return panel;
	}

	public showPanel (panel: Component) {
		for (const panel of this.panels)
			panel.attributes.add("inert")
				.classes.add(Classes.Hidden);

		panel.attributes.remove("inert")
			.classes.remove(Classes.Hidden);

		return this;
	}

	public toggle (reason = "generic") {
		if (this.isOpen())
			this.close(reason);
		else
			this.open(reason);

		return this.isOpen();
	}

	public open (reason = "generic") {
		this.openReasons.add(reason);
		this.classes.remove(Classes.Hidden);
		this.attributes.remove("inert");
	}

	public close (force: true): void;
	public close (reason?: string): void;
	public close (reason: string | true = "generic") {
		if (reason === true)
			this.openReasons.clear();
		else
			this.openReasons.delete(reason);

		if (!this.openReasons.size) {
			this.classes.add(Classes.Hidden);
			this.attributes.add("inert");
		}
	}

	public override removeContents (): this {
		while (this.element.lastChild && this.element.lastChild !== this.closeButton.element)
			this.element.lastChild?.remove();
		return this;
	}
}

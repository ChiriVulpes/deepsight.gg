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
	protected override onMake (): void {
		this.panels = new Set();
		this.classes.add(DrawerClasses.Main, Classes.Hidden)
			.attributes.add("inert")
			.attributes.set("tabindex", "0")
			.event.subscribe("mousedown", event => {
				if (!(event.target as HTMLElement).closest("button, input")) {
					// focus the drawer 
					this.element.focus();
					this.event.emit("focus", new FocusEvent("focus"));
				}
			});

		Button.create()
			.classes.add(DrawerClasses.Close)
			.event.subscribe("mousedown", () => this.close())
			.event.subscribe("click", () => this.close())
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

	public open () {
		this.classes.remove(Classes.Hidden);
		this.attributes.remove("inert");
	}

	public close () {
		this.classes.add(Classes.Hidden);
		this.attributes.add("inert");
	}
}

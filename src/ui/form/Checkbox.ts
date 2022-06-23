import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";

export interface ICheckboxEvents extends ComponentEvents {
	update: { checked: boolean };
}

export enum CheckboxClasses {
	Main = "checkbox",
	Checkbox = "checkbox-checkbox",
	Label = "checkbox-label",
}

export default class Checkbox extends Component<HTMLLabelElement, [boolean?]> {

	public override readonly event!: ComponentEventManager<this, ICheckboxEvents>;

	public static override readonly defaultType = "label";

	public get checked () {
		return this.checkbox.element.checked;
	}
	public set checked (checked: boolean) {
		this.checkbox.element.checked = checked;
		this.event.emit("update", { checked });
	}

	public checkbox!: Component<HTMLInputElement>;
	public label!: Component<HTMLSpanElement>;

	protected override onMake (checked?: boolean): void {
		this.classes.add(CheckboxClasses.Main);

		this.label = Component.create("span")
			.classes.add(CheckboxClasses.Label)
			.appendTo(this);

		this.checkbox = Component.create("input")
			.classes.add(CheckboxClasses.Checkbox)
			.attributes.set("type", "checkbox")
			.event.subscribe("change", () =>
				this.event.emit("update", { checked: this.checkbox.element.checked }))
			.appendTo(this);

		this.checkbox.element.checked = !!checked;
	}
}

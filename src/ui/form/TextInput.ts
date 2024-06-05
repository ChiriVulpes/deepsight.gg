import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Button from "ui/form/Button";

export enum TextInputClasses {
	Main = "text-input",
	Input = "text-input-input",
	Clear = "text-input-clear",
	Clear1 = "text-input-clear1",
	_HasInput = "text-input--has-input",
}

export default class TextInput extends Component {
	public input!: Component<HTMLInputElement>;
	public clear!: Button;

	public get inputText () {
		return this.input.element.value ?? "";
	}

	public set inputText (value: string) {
		this.input.element.value = value;
		this.clear.classes.toggle(this.inputText === "", Classes.Hidden)
			.attributes.toggle(this.inputText === "", "inert");
	}

	protected override onMake (): void {
		this.classes.add(TextInputClasses.Main);

		this.input = Component.create("input")
			.classes.add(TextInputClasses.Input)
			.attributes.set("type", "text")
			.event.subscribe("input", () => {
				this.event.emit("input");
				this.classes.toggle(this.inputText !== "", TextInputClasses._HasInput);
				this.clear.classes.toggle(this.inputText === "", Classes.Hidden)
					.attributes.toggle(this.inputText === "", "inert");
			})
			.event.subscribe("change", () => this.event.emit("change"))
			.appendTo(this);

		this.clear = Button.create()
			.classes.add(TextInputClasses.Clear, Classes.Hidden)
			.attributes.add("inert")
			.append(Component.create("span")
				.classes.add(TextInputClasses.Clear1))
			.event.subscribe("click", () => {
				this.input.element.value = "";
				this.event.emit("input");
				this.event.emit("change");
			})
			.appendTo(this);
	}

	public setPlaceholder (placeholder: string) {
		this.input.attributes.set("placeholder", placeholder);
		return this;
	}
}

import Component from "ui/Component";


enum InputMouse {
	MouseLeft,
	MouseRight,
	MouseMiddle,
}

enum InputModifier {
	Ctrl,
	Shift,
	Alt,
}

export type Modifier = keyof typeof InputModifier;

export type InputCatalyst = keyof typeof InputMouse;
export interface IInput {
	catalyst: InputCatalyst;
	modifiers: Set<Modifier>;
}
export namespace IInput {
	export function get (catalyst: InputCatalyst, ...modifiers: Modifier[]): IInput {
		return {
			catalyst,
			modifiers: new Set(modifiers),
		};
	}
}

enum HintClasses {
	Hint = "hint",
	HintLabel = "hint-label",
	HintInput = "hint-input",
	HintInputMouse = "hint-input-mouse",
	HintInputMouseElements = "hint-input-mouse-elements",
	HintInputModifier = "hint-input-modifier",
}

export class Hint extends Component<HTMLElement, [IInput?]> {

	public input!: HintInput;
	public label!: Component;

	protected override onMake (input?: IInput) {
		this.classes.add(HintClasses.Hint);

		HintInput.create([input])
			.appendTo(this);

		this.label = Component.create("span")
			.classes.add(HintClasses.HintLabel)
			.appendTo(this);
	}
}

class HintInput extends Component<HTMLElement, [IInput?]> {
	protected override onMake (input: IInput): void {
		this.classes.add(HintClasses.HintInput);
		this.set(input);
	}

	public set (input?: IInput) {
		this.removeContents();
		if (!input)
			return;

		for (const modifier of ["Ctrl", "Shift", "Alt"] as Modifier[]) {
			if (input.modifiers.has(modifier)) {
				Component.create("i")
					.classes.add(HintClasses.HintInputModifier, `${HintClasses.HintInputModifier}-${modifier.toLowerCase()}`)
					.appendTo(this);
			}
		}

		if (input.catalyst.startsWith("Mouse")) {
			this.classes.add(HintClasses.HintInputMouse, `${HintClasses.HintInput}-${input.catalyst.toLowerCase()}`);
			Component.create("i")
				.classes.add(HintClasses.HintInputMouseElements)
				.appendTo(this);
		}
	}
}
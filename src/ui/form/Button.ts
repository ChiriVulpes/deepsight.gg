import Component from "ui/Component";

export enum ButtonClasses {
	Main = "button",
	Icon = "button-icon",
	Attention = "button-attention",
}

export default class Button<ARGS extends any[] = []> extends Component<HTMLButtonElement, ARGS> {

	protected static override defaultType = "button";

	protected override onMake (...args: ARGS) {
		this.classes.add(ButtonClasses.Main);
	}
}

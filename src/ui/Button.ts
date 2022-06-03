import Component from "ui/Component";

export enum ClassesButton {
	Main = "button",
	Attention = "button-attention",
}

export default class Button extends Component<HTMLButtonElement> {

	protected static override defaultType = "button";

	protected override onMake (): void {
		this.classes.add(ClassesButton.Main);
	}
}

import Component from "ui/Component";

export enum ButtonClasses {
	Main = "button",
}

export default class Button extends Component<HTMLButtonElement> {

	protected static override defaultType = "button";

	protected override onMake (): void {
		this.classes.add(ButtonClasses.Main);
	}
}

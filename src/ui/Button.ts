import Component from "ui/Component";

export default class Button extends Component<HTMLButtonElement> {

	protected static override defaultType = "button";

	protected override onMake (): void {
		this.classes.add("button");
		console.log(this.classes.has("button"));
	}
}

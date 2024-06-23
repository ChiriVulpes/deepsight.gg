import Button from "ui/component/Button";
import Component from "ui/component/Component";

export enum DescribedButtonClasses {
	Description = "button-description",
}

export default class DescribedButton extends Component {

	public button!: Button;
	public description!: Component<HTMLParagraphElement>;

	protected override onMake (): void {
		this.button = Button.basic()
			.appendTo(this);
		this.description = Component.create("p")
			.classes.add(DescribedButtonClasses.Description)
			.appendTo(this);
	}
}
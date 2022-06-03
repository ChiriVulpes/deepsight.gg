import Component from "ui/Component";

export enum LabelClasses {
	Main = "label-wrapper",
	Label = "label",
	Content = "label-content",
}

export default class Label extends Component {

	public label!: Component;
	public content!: Component;

	protected override onMake (): void {
		this.classes.add(LabelClasses.Main);
		this.label = Component.create()
			.classes.add(LabelClasses.Label)
			.appendTo(this);
		this.content = Component.create()
			.classes.add(LabelClasses.Content)
			.appendTo(this);
	}
}

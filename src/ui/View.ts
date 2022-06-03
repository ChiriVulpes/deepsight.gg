import Component from "ui/Component";

export enum ViewClasses {
	Main = "view",
	Content = "view-content",
	Hidden = "view-hidden",
}

export default abstract class View extends Component {

	private static index = 0;

	public content!: Component;

	protected override onMake (): void {
		this.classes.add(ViewClasses.Main, this.getId());

		this.style.set("--index", `${View.index++}`);

		this.content = Component.create()
			.classes.add(ViewClasses.Content)
			.appendTo(this);

		this.onMakeView();
	}

	protected abstract getId (): string;
	protected abstract onMakeView (): void;
}

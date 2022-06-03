import Component, { ComponentClass } from "ui/Component";
import { EventManager } from "utility/EventManager";

export interface ViewClass extends ComponentClass<View> {
	readonly id: string;
	readonly destinationName?: string;
	show: (typeof View)["show"];
}

export enum ClassesView {
	Main = "view",
	Content = "view-content",
	Hidden = "view-hidden",
}

export interface IViewEvents {
	show: { view: View };
}

export default abstract class View extends Component {

	public static readonly event = EventManager.make<IViewEvents>();

	public static show () {
		const view = this.create();
		this.event.emit("show", { view });
	}

	private static index = 0;

	public get id () {
		return (this.constructor as any as ViewClass).id;
	}

	public content!: Component;

	protected override onMake (): void {
		this.classes.add(ClassesView.Main, `view-${this.id}`);

		this.style.set("--index", `${View.index++}`);

		this.content = Component.create()
			.classes.add(ClassesView.Content)
			.appendTo(this);

		this.onMakeView();
	}

	public shouldDisplayNav () {
		return true;
	}

	public abstract getName (): string;
	protected abstract onMakeView (): void;
}

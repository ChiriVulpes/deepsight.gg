import Component from "ui/component/Component";
import { Hint, IInput } from "ui/component/Hints";
import Async from "utility/Async";
import Bound from "utility/decorator/Bound";

export enum DialogClasses {
	Main = "dialog",
	_Closed = "dialog--closed",
	Title = "dialog-title",
	Content = "dialog-content",
	Body = "dialog-body",
	Hints = "dialog-hints",
}

export default class Dialog extends Component<HTMLDialogElement> {

	protected static override defaultType = "dialog";

	public title!: Component;
	public content!: Component;
	public body!: Component;
	public hints!: Component;
	public hintDismiss!: Hint;

	protected override onMake (): void {
		this.classes.add(DialogClasses.Main);

		this.content = Component.create()
			.classes.add(DialogClasses.Content)
			.appendTo(this);

		this.title = Component.create("h2")
			.classes.add(DialogClasses.Title)
			.appendTo(this.content);

		this.body = Component.create()
			.classes.add(DialogClasses.Body)
			.appendTo(this.content);

		this.hints = Component.create("footer")
			.classes.add(DialogClasses.Hints)
			.appendTo(this);

		this.hintDismiss = Hint.Button.create([IInput.get("KeyEsc")])
			.tweak(hint => hint.label.text.set("Dismiss"))
			.event.subscribe("click", this.close)
			.appendTo(this.hints);

		this.event.subscribe("mousedown", this.onMouseDown);
		this.event.subscribe("keydown", this.onKeyDown);
	}

	public get isOpen () {
		return this.element.open;
	}

	private closing = false;
	public open () {
		if (this.closing)
			return;

		this.classes.remove(DialogClasses._Closed);
		this.element.showModal();
	}

	@Bound public async close () {
		if (this.closing)
			return;

		this.closing = true;
		this.style.set("--height-pre-close", `${this.element.clientHeight}px`);
		this.classes.add(DialogClasses._Closed);
		await Async.sleep(500);
		this.element.close();
		this.closing = false;
	}

	@Bound private onMouseDown (event: MouseEvent) {
		if (!this.getRect().containsPoint(event.clientX, event.clientY)) {
			void this.close();
		}
	}

	@Bound private onKeyDown (event: KeyboardEvent) {
		if (event.code === "Escape") {
			event.preventDefault();
			void this.close();
		}
	}
}

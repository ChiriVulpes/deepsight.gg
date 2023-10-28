import Component from "ui/Component";

export enum ButtonClasses {
	Main = "button",
	Icon = "button-icon",
	InnerIcon = "button-icon-inner",
	Attention = "button-attention",
	LaserFocus = "button-laser-focus",
	Selected = "button-selected",
	Primary = "button-primary",
}

export default class Button<ARGS extends any[] = []> extends Component<HTMLButtonElement, ARGS> {

	public static basic () {
		return Button.create([]) as Button<[]>;
	}

	protected static override defaultType = "button";

	protected override onMake (...args: ARGS) {
		this.classes.add(ButtonClasses.Main);
	}

	public innerIcon?: Component;
	public addIcon (tweaker?: (component: Component) => any) {
		this.innerIcon?.remove();
		return this.prepend(this.innerIcon = Component.create()
			.classes.add(ButtonClasses.InnerIcon)
			.append(Component.create())
			.append(Component.create())
			.tweak(tweaker));
	}

	public setPrimary () {
		return this.classes.add(ButtonClasses.Primary);
	}

	public setLaserFocus () {
		Component.create()
			.classes.add(ButtonClasses.LaserFocus)
			.appendTo(this);
		return this;
	}

	public setAttention () {
		Component.create()
			.classes.add(ButtonClasses.Attention)
			.appendTo(this);
		return this;
	}

	public click () {
		this.element.click();
		return this;
	}

	public setDisabled (disabled = true) {
		this.attributes.toggle(disabled, "disabled");
		return this;
	}
}

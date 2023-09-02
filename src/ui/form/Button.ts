import Component from "ui/Component";

export enum ButtonClasses {
	Main = "button",
	Icon = "button-icon",
	InnerIcon = "button-icon-inner",
	Attention = "button-attention",
	LaserFocus = "button-laser-focus",
	Selected = "button-selected",
	Primary = "button-primary",
	HasWipeAnimation = "button-has-wipe-animation",
	HasWipeAnimationOut = "button-has-wipe-animation-out",
	WipeAnimation = "button-wipe-animation",
	WipeAnimationOut = "button-wipe-animation-out",
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

	protected laserFocus?: Component;
	public setLaserFocus () {
		this.laserFocus ??= Component.create()
			.classes.add(ButtonClasses.LaserFocus)
			.appendTo(this);
		return this;
	}

	protected attention?: Component;
	public setAttention () {
		this.attention ??= Component.create()
			.classes.add(ButtonClasses.Attention)
			.appendTo(this);
		return this;
	}

	protected wipeAnimation?: Promise<void>;
	public async animateWipe (initialiser: () => any) {
		while (this.wipeAnimation)
			await this.wipeAnimation;

		this.wipeAnimation = (async () => {
			const wipe = Component.create()
				.classes.add(ButtonClasses.WipeAnimation)
				.appendTo(this);
			this.classes.add(ButtonClasses.HasWipeAnimation);
			await new Promise(resolve => wipe.event.subscribe("animationend", resolve));
			initialiser();
			this.classes.add(ButtonClasses.HasWipeAnimationOut);
			wipe.classes.add(ButtonClasses.WipeAnimationOut);
			await new Promise(resolve => wipe.event.subscribe("animationend", resolve));
			wipe.remove();
			this.classes.remove(ButtonClasses.HasWipeAnimation, ButtonClasses.HasWipeAnimationOut);
		})();

		await this.wipeAnimation;
		delete this.wipeAnimation;
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

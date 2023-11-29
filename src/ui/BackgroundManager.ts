import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Arrays from "utility/Arrays";
import Functions from "utility/Functions";
import Store from "utility/Store";
import type { SupplierOr } from "utility/Type";
import Bound from "utility/decorator/Bound";

enum BackgroundClasses {
	Surface = "background-surface",
	Blur = "background-surface-blur",
	Image = "background-image",
}

export default class Background extends Component<HTMLElement, [path: SupplierOr<Arrays.Or<string> | undefined>]> {

	private static main?: Background;
	public static initialiseMain () {
		const manager = this.main ??= Background.create([() => Store.items.settingsBackground])
			.setBlurred(() => Store.items.settingsBackgroundBlur)
			.appendTo(document.body);
		Store.event.subscribe("setSettingsBackground", manager.updateBackground);
		Store.event.subscribe("deleteSettingsBackground", manager.updateBackground);
		Store.event.subscribe("setSettingsBackgroundBlur", manager.updateBackgroundBlur);
		Store.event.subscribe("setSettingsBackgroundFollowMouse", manager.updateBackgroundFollowMouse);
	}

	private static getScrollAmount () {
		return Store.items.settingsBackgroundFollowMouse ? 0.05 : 0;
	}

	private blurred?: SupplierOr<boolean | undefined>;
	private path!: SupplierOr<Arrays.Or<string> | undefined>;

	protected override onMake (path: SupplierOr<Arrays.Or<string> | undefined>): void {
		this.path = path;
		this.classes.add(BackgroundClasses.Surface);

		this.updateBackground();
		this.updateBackgroundBlur();
		this.updateBackgroundFollowMouse();

		document.body.addEventListener("mousemove", event => {
			this.element.scrollLeft = (event.clientX / window.innerWidth) * window.innerWidth * Background.getScrollAmount();
			this.element.scrollTop = (event.clientY / window.innerHeight) * window.innerHeight * Background.getScrollAmount();
		});
	}

	public setPath (path: SupplierOr<string | undefined>) {
		this.path = path;
		this.updateBackground();
		return this;
	}

	public setBlurred (blurred: SupplierOr<boolean | undefined>) {
		this.blurred = blurred;
		this.updateBackgroundBlur();
		return this;
	}

	@Bound private updateBackground () {
		const background = Arrays.resolve(Functions.resolve(this.path));
		this.removeContents();

		if (background.length) {
			this.classes.add(Classes.Hidden);

			let loaded = 0;
			for (let i = 0; i < background.length; i++) {
				Component.create("img")
					.classes.add(BackgroundClasses.Image, `${BackgroundClasses.Image}-${i}`)
					.attributes.set("src", background[i])
					.event.subscribe("load", () => {
						loaded++;
						if (loaded >= background.length)
							this.classes.remove(Classes.Hidden);
					})
					.appendTo(this);
			}
		}
	}

	@Bound private updateBackgroundBlur () {
		this.classes.toggle(!!Functions.resolve(this.blurred), BackgroundClasses.Blur);
	}

	@Bound private updateBackgroundFollowMouse () {
		this.style.set("--scroll-amount", `${Background.getScrollAmount()}`);
	}
}


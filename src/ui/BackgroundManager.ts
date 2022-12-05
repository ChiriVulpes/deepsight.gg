import Component from "ui/Component";
import Store from "utility/Store";

enum BackgroundClasses {
	Surface = "background-surface",
	Blur = "background-surface-blur",
}

export default class BackgroundManager {

	private static readonly surface = Component.create()
		.classes.add(BackgroundClasses.Surface)
		.appendTo(document.body);

	private static getScrollAmount () {
		return Store.items.settingsBackgroundFollowMouse ? 0.05 : 0;
	}

	public constructor () {
		Store.event.subscribe("setSettingsBackground", this.updateBackground);
		Store.event.subscribe("deleteSettingsBackground", this.updateBackground);
		Store.event.subscribe("setSettingsBackgroundBlur", this.updateBackgroundBlur);
		Store.event.subscribe("setSettingsBackgroundFollowMouse", this.updateBackgroundFollowMouse);
		this.updateBackground();
		this.updateBackgroundBlur();
		this.updateBackgroundFollowMouse();

		const surface = BackgroundManager.surface;
		document.body.addEventListener("mousemove", event => {
			surface.element.scrollLeft = (event.clientX / window.innerWidth) * window.innerWidth * BackgroundManager.getScrollAmount();
			surface.element.scrollTop = (event.clientY / window.innerHeight) * window.innerHeight * BackgroundManager.getScrollAmount();
		});
	}

	private updateBackground () {
		const background = Store.items.settingsBackground;
		if (background)
			BackgroundManager.surface.style.set("--wallpaper", `url("${background}")`);
		else
			BackgroundManager.surface.style.remove("--wallpaper");
	}

	private updateBackgroundBlur () {
		BackgroundManager.surface.classes.toggle(!!Store.items.settingsBackgroundBlur, BackgroundClasses.Blur);
	}

	private updateBackgroundFollowMouse () {
		BackgroundManager.surface.style.set("--scroll-amount", `${BackgroundManager.getScrollAmount()}`);
	}
}


import Model from "model/Model";
import AppNav from "ui/AppNav";
import UiEventBus from "ui/UiEventBus";
import AuthView from "ui/view/AuthView";
import InventoryKineticView from "ui/view/inventory/InventoryKineticView";
import ViewManager from "ui/ViewManager";
import Bungie from "utility/endpoint/bungie/Bungie";
import Env from "utility/Env";
import Store from "utility/Store";
import URL from "utility/URL";

export default class FluffiestVaultManager {

	public constructor () {
		void this.main();
	}

	private async main () {

		UiEventBus.subscribe("keydown", event => {
			if (event.use("F6"))
				for (const stylesheet of document.querySelectorAll("link[rel=stylesheet]")) {
					const href = stylesheet.getAttribute("href")!;
					const newHref = `${href.slice(0, Math.max(0, href.indexOf("?")) || Infinity)}?${Math.random().toString().slice(2)}`;
					stylesheet.setAttribute("href", newHref);
				}

			if (event.use("F4"))
				document.documentElement.classList.add("persist-tooltips");
		});
		UiEventBus.subscribe("keyup", event => {
			if (event.use("F4"))
				document.documentElement.classList.remove("persist-tooltips");
		});

		Store.event.subscribe("setSettingsBackground", this.updateBackground);
		Store.event.subscribe("deleteSettingsBackground", this.updateBackground);
		Store.event.subscribe("setSettingsBackgroundBlur", this.updateBackgroundBlur);
		this.updateBackground();
		this.updateBackgroundBlur();

		await Env.load();

		Bungie.event.subscribe("error", event => {
			const iframe = document.createElement("iframe");
			document.body.appendChild(iframe);
			iframe.contentDocument?.write(event.responseText);
		});

		Bungie.event.subscribe("resetAuthentication", async _ => {
			await Model.clearCache();
			AuthView.show();
		});

		await Bungie.authenticate("complete");

		if (Bungie.authenticated) {
			AppNav.create([ViewManager])
				.appendTo(document.body);

			if (URL.hash === AuthView.id)
				URL.hash = "";

			ViewManager.showByHash(URL.hash);
			if (!ViewManager.hasView())
				InventoryKineticView.show();

		} else {
			AuthView.show();
		}
	}

	private updateBackground () {
		const background = Store.items.settingsBackground;
		if (background)
			document.documentElement.style.setProperty("background-image", `url("${background}")`);
		else
			document.documentElement.style.removeProperty("background-image");
	}

	private updateBackgroundBlur () {
		document.body.classList.toggle("blur", Store.items.settingsBackgroundBlur);
	}
}

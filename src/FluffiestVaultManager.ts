import Model from "model/Model";
import AppNav from "ui/AppNav";
import AuthView from "ui/view/AuthView";
import InventoryKineticView from "ui/view/inventory/InventoryKineticView";
import ViewManager from "ui/ViewManager";
import Bungie from "utility/endpoint/bungie/Bungie";
import Env from "utility/Env";
import URL from "utility/URL";

export default class FluffiestVaultManager {

	public constructor () {
		void this.main();
	}

	private async main () {

		document.addEventListener("keydown", event => {
			switch (event.key) {
				case "F6": {
					for (const stylesheet of document.querySelectorAll("link[rel=stylesheet]")) {
						const href = stylesheet.getAttribute("href")!;
						const newHref = `${href.slice(0, Math.max(0, href.indexOf("?")) || Infinity)}?${Math.random().toString().slice(2)}`;
						stylesheet.setAttribute("href", newHref);
					}
					break;
				}
				case "F4": {
					document.documentElement.classList.toggle("persist-tooltips");
					break;
				}
				case "e": {
					document.documentElement.classList.add("show-extra-info");
					break;
				}
			}
		});
		document.addEventListener("keyup", event => {
			switch (event.key) {
				case "e": {
					document.documentElement.classList.remove("show-extra-info");
					break;
				}
			}
		});

		await Env.load();

		Bungie.event.subscribe("error", event => {
			const iframe = document.createElement("iframe");
			document.body.appendChild(iframe);
			iframe.contentDocument?.write(event.responseText);
		});

		Bungie.event.subscribe("resetAuthentication", _ => {
			void Model.clearCache();
			AuthView.show();
		});

		await Bungie.authenticate("complete");

		if (Bungie.authenticated) {
			AppNav.create([ViewManager])
				.appendTo(document.body);

			if (URL.hash === AuthView.id)
				URL.hash = "";

			ViewManager.showById(URL.hash);
			if (!ViewManager.hasView())
				InventoryKineticView.show();

		} else {
			AuthView.show();
		}
	}
}

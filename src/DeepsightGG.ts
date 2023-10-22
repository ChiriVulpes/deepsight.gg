import Model from "model/Model";
import { ManifestManager } from "model/models/Manifest";
import AppNav from "ui/AppNav";
import BackgroundManager from "ui/BackgroundManager";
import UiEventBus from "ui/UiEventBus";
import AuthView from "ui/view/AuthView";
import ViewManager from "ui/ViewManager";
import Bungie from "utility/endpoint/bungie/Bungie";
import Env from "utility/Env";
import URL from "utility/URL";

void screen?.orientation?.lock("portrait-primary").catch(() => { });

export default class DeepsightGG {

	public constructor () {
		void this.main();
	}

	private async main () {

		ManifestManager.initialise();

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

		new BackgroundManager();

		await Env.load();

		Bungie.event.subscribe("resetAuthentication", async _ => {
			await Model.clearCache();
			AuthView.show();
		});

		await Bungie.authenticate("complete");

		if (Bungie.authenticated) {

			Bungie.event.subscribe("apiDown", () => document.body.classList.add("bungie-api-down"));
			Bungie.event.subscribe("querySuccess", () => document.body.classList.remove("bungie-api-down"));

			AppNav.create([ViewManager])
				.appendTo(document.body);

			if (URL.hash === AuthView.id)
				URL.hash = "";

			ViewManager.showByHash(URL.hash);
			if (!ViewManager.hasView())
				ViewManager.showDefaultView();

		} else {
			AuthView.show();
		}
	}
}

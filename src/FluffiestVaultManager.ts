import Model from "model/Model";
import AppNav from "ui/AppNav";
import AuthView from "ui/view/AuthView";
import InventoryOverviewView from "ui/view/InventoryOverviewView";
import ViewManager from "ui/ViewManager";
import Bungie from "utility/bungie/Bungie";
import Env from "utility/Env";
import URL from "utility/URL";

export default class FluffiestVaultManager {

	public constructor () {
		void this.main();
	}

	private async main () {

		document.addEventListener("keydown", event => {
			if (event.key === "F6") {
				for (const stylesheet of document.querySelectorAll("link[rel=stylesheet]")) {
					const href = stylesheet.getAttribute("href")!;
					const newHref = `${href.slice(0, Math.max(0, href.indexOf("?")) || Infinity)}?${Math.random().toString().slice(2)}`;
					stylesheet.setAttribute("href", newHref);
				}
			}
		})

		await Env.load();

		Bungie.event.subscribe("error", event => {
			const iframe = document.createElement("iframe");
			document.body.appendChild(iframe);
			iframe.contentDocument?.write(event.responseText);
		});

		Bungie.event.subscribe("resetAuthentication", _ => {
			Model.clearCache();
			AuthView.show();
		});

		await Bungie.authenticate("complete");

		if (Bungie.authenticated) {
			AppNav.create([ViewManager])
				.appendTo(document.body);

			ViewManager.showById(URL.hash);
			if (!ViewManager.hasView())
				InventoryOverviewView.show();

			// const memberships = await GetMembershipsForCurrentUser.query();
			// console.log(memberships);

		} else {
			AuthView.show();
		}
	}
}

import AuthView from "ui/view/AuthView";
import InventoryOverviewView from "ui/view/InventoryOverviewView";
import ViewManager from "ui/ViewManager";
import Bungie from "utility/Bungie";
import Env from "utility/Env";
import URL from "utility/URL";

export default class FluffiestVaultManager {

	public constructor () {
		void this.main();
	}

	private async main () {
		await Env.load();

		Bungie.event.subscribe("error", event => {
			const iframe = document.createElement("iframe");
			document.body.appendChild(iframe);
			iframe.contentDocument?.write(event.responseText);
		});

		Bungie.event.subscribe("resetAuthentication", _ => {
			AuthView.show();
		});

		await Bungie.authenticate("complete");

		if (Bungie.authenticated) {
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

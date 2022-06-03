import Component from "ui/Component";
import AuthView from "ui/view/AuthView";
import ViewManager from "ui/ViewManager";
import Bungie from "utility/Bungie";
import GetMembershipsForCurrentUser from "utility/bungie/endpoint/user/GetMembershipsForCurrentUser";
import Env from "utility/Env";

export default class FluffiestVaultManager {

	public get title () { return document.title; }
	public set title (title: string) { document.title = title; }

	public readonly views = new ViewManager();

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
			this.views.show(AuthView.create());
		});

		await Bungie.authenticate("complete");

		if (Bungie.authenticated) {
			Component.create()
				.text.set("you're logged in uwu")
				.appendTo(document.body);

			const memberships = await GetMembershipsForCurrentUser.query();
			console.log(memberships);

		} else {
			this.views.show(AuthView.create());
		}
	}
}

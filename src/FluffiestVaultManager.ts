import Button from "ui/Button";
import Component from "ui/Component";
import Bungie from "utility/Bungie";
import GetMembershipsForCurrentUser from "utility/bungie/endpoint/user/GetMembershipsForCurrentUser";
import Env from "utility/Env";

export default class FluffiestVaultManager {

	public get title () { return document.title; }
	public set title (title: string) { document.title = title; }

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

		Bungie.event.subscribe("resetAuthentication", event => {
			console.log(event);
		});

		await Bungie.authenticate("complete");

		if (Bungie.authenticated) {
			Component.create()
				.text.set("you're logged in uwu")
				.appendTo(document.body);

			const memberships = await GetMembershipsForCurrentUser.query();
			console.log(memberships);

		} else {
			Button.create()
				.text.set("owo!!!!! you're not logged in!!!! click here to do so")
				.event.subscribe("click", () =>
					void Bungie.authenticate("start").catch(err => console.error(err)))
				.appendTo(document.body);
		}
	}
}

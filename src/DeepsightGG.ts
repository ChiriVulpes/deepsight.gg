import Model from "model/Model";
import Activities from "model/models/Activities";
import { getPrimaryDestinyMembership } from "model/models/Memberships";
import ProfileBatch from "model/models/ProfileBatch";
import AppNav from "ui/AppNav";
import Background from "ui/BackgroundManager";
import UiEventBus from "ui/UiEventBus";
import AuthView from "ui/view/AuthView";
import ViewManager from "ui/ViewManager";
import Bungie from "utility/endpoint/bungie/Bungie";
import SearchDestinyPlayerByBungieName from "utility/endpoint/bungie/endpoint/destiny2/SearchDestinyPlayerByBungieName";
import Env from "utility/Env";
import Fonts from "utility/Fonts";
import Store from "utility/Store";
import URL from "utility/URL";

void screen?.orientation?.lock?.("portrait-primary").catch(() => { });

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(window as any).Activities = Activities;


export default class DeepsightGG {

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

		await Env.load();
		void Fonts.check();

		void Background.initialiseMain();

		Bungie.event.subscribe("resetAuthentication", async _ => {
			await Model.clearCache();
			AuthView.show();
			document.documentElement.classList.remove("authenticated");
		});

		Bungie.event.subscribe("authenticated", _ => {
			document.documentElement.classList.add("authenticated");
		});

		await Bungie.authenticate("complete");

		if (Bungie.authenticated) {
			Bungie.event.subscribe("apiDown", () => document.body.classList.add("bungie-api-down"));
			Bungie.event.subscribe("querySuccess", () => document.body.classList.remove("bungie-api-down"));
			document.documentElement.classList.add("authenticated");
		}

		await ProfileBatch.await();

		const bungieId = URL.bungieID;
		const destinyMembership = !bungieId ? undefined
			: await SearchDestinyPlayerByBungieName.query(bungieId.name, bungieId.code)
				.then(memberships => getPrimaryDestinyMembership(memberships));

		const membershipOverride = Store.items.destinyMembershipOverride;
		if (destinyMembership && (membershipOverride?.bungieGlobalDisplayName !== destinyMembership.bungieGlobalDisplayName || membershipOverride.bungieGlobalDisplayNameCode !== destinyMembership.bungieGlobalDisplayNameCode))
			Store.items.destinyMembershipOverride = destinyMembership;

		AppNav.create([ViewManager])
			.appendTo(document.body);

		const path = URL.path ?? URL.hash;
		if (path === AuthView.id) {
			URL.hash = null;
			URL.path = null;
		}

		ViewManager.showByHash(URL.path ?? URL.hash);
	}
}

import Activities from "model/models/Activities";
import AppNav from "ui/AppNav";
import Background from "ui/component/BackgroundManager";
import UiEventBus from "ui/utility/UiEventBus";
import ViewManager from "ui/utility/ViewManager";
import AuthView from "ui/view/AuthView";
import BungieID from "utility/BungieID";
import Env from "utility/Env";
import Fonts from "utility/Fonts";
import ProfileManager from "utility/ProfileManager";
import Store from "utility/Store";
import URL from "utility/URL";
import Bound from "utility/decorator/Bound";
import Bungie from "utility/endpoint/bungie/Bungie";

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

		Bungie.event.subscribe(["resetAuthentication", "authenticated"], this.refreshProfileState);

		const didAuthenticate = Store.items.profiles?.[""] && await Bungie.authenticate("complete");
		if (didAuthenticate) {
			location.reload();
			return;
		}

		Bungie.event.subscribe("apiDown", () => document.body.classList.add("bungie-api-down"));
		Bungie.event.subscribe("querySuccess", () => document.body.classList.remove("bungie-api-down"));
		if (Bungie.authenticated) {
			document.documentElement.classList.add("authenticated");
		}

		void Background.initialiseMain();

		const bungieId = URL.bungieID;
		const idString = bungieId && BungieID.stringify(bungieId);
		if (idString && (idString !== Store.items.selectedProfile || !ProfileManager.byId(idString))) {
			if (Store.items.profiles?.[idString]) {
				Store.items.selectedProfile = idString;
				location.reload();
				return;
			}

			const path = URL.path;

			const profile = await ProfileManager.reinit(bungieId);
			Store.items.selectedProfile = profile ? idString : undefined;

			URL.path = path;

			location.reload();
			return;
		}

		if (!bungieId) {
			const profile = ProfileManager.get();
			if (profile) {
				const path = URL.path;
				Store.items.selectedProfile = BungieID.stringify(profile.id);
				URL.path = path;
			}
		}

		this.refreshProfileState();
		Store.event.subscribe(["setSelectedProfile", "deleteSelectedProfile"], this.refreshProfileState);

		AppNav.create([ViewManager])
			.appendTo(document.body);

		const path = URL.path ?? URL.hash;
		if (path === AuthView.id) {
			URL.hash = null;
			URL.path = null;
		}

		ViewManager.showByHash(URL.path ?? URL.hash);

		const viewRequiredAuth = !ViewManager.view ? undefined : (ViewManager.view?.definition.auth ?? "spy");
		const needsAuthView = false
			|| (viewRequiredAuth === "required" && !ProfileManager.isAuthenticated())
			|| (viewRequiredAuth === "spy" && !ProfileManager.get())
			|| false;
		if (needsAuthView)
			AuthView.show();
	}

	@Bound private refreshProfileState () {
		const profile = ProfileManager.get();
		if (profile?.id)
			ProfileManager.update(profile.id);

		const authenticated = !!profile?.data.accessToken;
		const spying = !!profile && !authenticated;
		document.documentElement.classList.toggle("spying", spying);
		document.documentElement.classList.toggle("authenticated", authenticated);
	}
}

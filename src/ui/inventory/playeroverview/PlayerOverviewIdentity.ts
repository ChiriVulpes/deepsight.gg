import Memberships from "model/models/Memberships";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Button from "ui/form/Button";
import Store from "utility/Store";
import URL from "utility/URL";
import Bound from "utility/decorator/Bound";
import Bungie from "utility/endpoint/bungie/Bungie";
import SearchDestinyPlayerByBungieName from "utility/endpoint/bungie/endpoint/destiny2/SearchDestinyPlayerByBungieName";

export enum PlayerOverviewIdentityClasses {
	Main = "player-overview-identity",
	Pretty = "player-overview-identity-pretty",
	PrettyId = "player-overview-identity-pretty-id",
	Username = "player-overview-identity-username",
	Code = "player-overview-identity-code",
	Override = "player-overview-identity-override",
	None = "player-overview-identity-none",
	Switch = "player-overview-identity-switch",
	// Input = "player-overview-identity-input",
}

export default class PlayerOverviewIdentity extends Component {

	public displayName?: string;
	public code?: string;

	public pretty!: Component;
	public prettyId!: Component;
	public prettyUsername!: Component;
	public prettyCode!: Component;
	public prettyOverride!: Component;
	public switchProfile!: Component;

	protected override onMake (): void {
		this.classes.add(PlayerOverviewIdentityClasses.Main);

		this.pretty = Button.create()
			.classes.add(PlayerOverviewIdentityClasses.Pretty)
			.append(this.prettyOverride = Component.create("span")
				.classes.add(PlayerOverviewIdentityClasses.Override)
				.text.set("spying on..."))
			.append(this.prettyId = Component.create("span")
				.classes.add(PlayerOverviewIdentityClasses.PrettyId)
				.append(this.prettyUsername = Component.create("span")
					.classes.add(PlayerOverviewIdentityClasses.Username)
					.text.set(this.displayName))
				.append(this.prettyCode = Component.create("span")
					.classes.add(PlayerOverviewIdentityClasses.Code)
					.text.set(`#${this.code}`)))
			.append(this.switchProfile = Component.create("span")
				.classes.add(PlayerOverviewIdentityClasses.Switch))
			.event.subscribe("click", () => {
				// this.input.style.set("width", `${this.pretty.element.clientWidth}px`);
				// this.pretty.classes.add(Classes.Hidden);
				// this.input.classes.remove(Classes.Hidden);
				// this.input.element.value = `${this.displayName}#${this.code}`;
				// this.input.element.select();
			})
			.appendTo(this);

		// this.input = Component.create("input")
		// 	.classes.add(PlayerOverviewIdentityClasses.Input, Classes.Hidden)
		// 	.attributes.set("type", "text")
		// 	.tweak(input => input.element.value = `${memberships.bungieNetUser?.cachedBungieGlobalDisplayName ?? "?"}#${this.code}`)
		// 	.event.subscribe("blur", () => this.accept())
		// 	.appendTo(this);

		// UiEventBus.subscribe("keydown", this.onGlobalKeydown);

		Store.event.subscribe(["setDestinyMembershipOverride", "deleteDestinyMembershipOverride"], this.update);
		this.update();
	}

	@Bound private update () {
		const profile = Store.getProfile();
		this.displayName = profile?.id.name;
		this.code = !profile ? undefined : profile.id.code.toString().padStart(4, "0");
		this.prettyUsername.text.set(this.displayName);
		this.prettyCode.text.set(`#${this.code}`);
		this.prettyOverride.classes.toggle(!profile || !!profile?.data?.accessToken, Classes.Hidden);
		this.prettyId.classes.toggle(profile === undefined, Classes.Hidden);
		this.switchProfile.text.set(profile === undefined ? "Select Profile" : "Switch Profile")
			.classes.toggle(profile !== undefined, Classes.Hidden);
		this.prettyUsername.classes.toggle(!profile, PlayerOverviewIdentityClasses.None);
	}

	private cancel () {
		if (Store.items.selectedProfile) {
			delete Store.items.selectedProfile;
			if (!Bungie.authenticated)
				URL.path = "/";
		}
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	private async accept () {
		// if (this.input.classes.has(Classes.Hidden))
		// 	return;

		// this.input.classes.add(Classes.Hidden);

		let searchString = ""; // this.input.element.value;
		if (!searchString.length)
			return this.cancel();

		const searchCode = +searchString.slice(-4);
		if (searchString[searchString.length - 5] !== "#" || isNaN(searchCode)) {
			this.pretty.classes.remove(Classes.Hidden);
			return;
		}

		searchString = searchString.slice(0, -5);
		if (searchString === this.displayName && `${searchCode}` === this.code) {
			this.pretty.classes.remove(Classes.Hidden);
			return;
		}

		const destinyMembership = await SearchDestinyPlayerByBungieName.query(searchString, searchCode)
			.then(memberships => Memberships.getPrimaryDestinyMembership(memberships));
		if (!destinyMembership)
			return this.cancel();

		// if (destinyMembership.bungieGlobalDisplayName === this.ownDisplayName && `${destinyMembership.bungieGlobalDisplayNameCode}` === this.ownCode)
		// 	return this.cancel();

		this.pretty.classes.remove(Classes.Hidden);
		this.displayName = destinyMembership.bungieGlobalDisplayName;
		this.code = `${destinyMembership.bungieGlobalDisplayNameCode ?? searchCode}`.padStart(4, "0");
		this.prettyUsername.text.set(this.displayName);
		this.prettyCode.text.set(`#${this.code}`);
		this.prettyOverride.classes.remove(Classes.Hidden);
		Store.items.selectedProfile = `${this.displayName}#${this.code}`;
	}

	// @Bound
	// private onGlobalKeydown (event: IKeyEvent) {
	// 	if (!document.contains(this.element)) {
	// 		UiEventBus.unsubscribe("keydown", this.onGlobalKeydown);
	// 		return;
	// 	}

	// 	if (!this.input.isFocused())
	// 		return;

	// 	if (event.useOverInput("Escape")) {
	// 		this.cancel();
	// 	}

	// 	if (event.useOverInput("Enter")) {
	// 		void this.accept();
	// 	}
	// }
}

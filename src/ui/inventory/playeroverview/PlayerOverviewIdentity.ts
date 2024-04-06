import type { UserMembershipData } from "bungie-api-ts/user";
import { getPrimaryDestinyMembership } from "model/models/Memberships";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import Store from "utility/Store";
import URL from "utility/URL";
import Bound from "utility/decorator/Bound";
import SearchDestinyPlayerByBungieName from "utility/endpoint/bungie/endpoint/destiny2/SearchDestinyPlayerByBungieName";

export enum PlayerOverviewIdentityClasses {
	Main = "player-overview-identity",
	Pretty = "player-overview-identity-pretty",
	Username = "player-overview-identity-username",
	Code = "player-overview-identity-code",
	Override = "player-overview-identity-override",
	Input = "player-overview-identity-input",
}

export default class PlayerOverviewIdentity extends Component<HTMLElement, [UserMembershipData]> {

	public ownDisplayName!: string;
	public ownCode!: string;

	public displayName!: string;
	public code!: string;

	public pretty!: Component;
	public prettyUsername!: Component;
	public prettyCode!: Component;
	public prettyOverride!: Component;
	public input!: Component<HTMLInputElement>;

	protected override onMake (memberships: UserMembershipData): void {
		this.classes.add(PlayerOverviewIdentityClasses.Main);

		this.ownDisplayName = memberships.bungieNetUser.cachedBungieGlobalDisplayName;
		this.ownCode = `${memberships.bungieNetUser.cachedBungieGlobalDisplayNameCode ?? "????"}`.padStart(4, "0");

		const overrideMembership = URL.bungieID ? Store.items.destinyMembershipOverride : undefined;
		this.displayName = overrideMembership?.bungieGlobalDisplayName ?? this.ownDisplayName;
		this.code = `${overrideMembership?.bungieGlobalDisplayNameCode ?? this.ownCode}`;

		this.pretty = Component.create()
			.classes.add(PlayerOverviewIdentityClasses.Pretty)
			.append(this.prettyUsername = Component.create()
				.classes.add(PlayerOverviewIdentityClasses.Username)
				.text.set(this.displayName))
			.append(this.prettyCode = Component.create()
				.classes.add(PlayerOverviewIdentityClasses.Code)
				.text.set(`#${this.code}`))
			.append(this.prettyOverride = Component.create()
				.classes.add(PlayerOverviewIdentityClasses.Override)
				.classes.toggle(this.code === this.ownCode, Classes.Hidden)
				.text.set("*"))
			.event.subscribe("click", () => {
				this.pretty.classes.add(Classes.Hidden);
				this.input.classes.remove(Classes.Hidden);
				this.input.element.value = `${this.displayName}#${this.code}`;
				this.input.element.select();
			})
			.appendTo(this);

		this.input = Component.create("input")
			.classes.add(PlayerOverviewIdentityClasses.Input, Classes.Hidden)
			.attributes.set("type", "text")
			.tweak(input => input.element.value = `${memberships.bungieNetUser.cachedBungieGlobalDisplayName}#${this.code}`)
			.event.subscribe("blur", () => this.accept())
			.appendTo(this);

		UiEventBus.subscribe("keydown", this.onGlobalKeydown);
	}

	private cancel () {
		this.displayName = this.ownDisplayName;
		this.code = this.ownCode;
		this.prettyUsername.text.set(this.displayName);
		this.prettyCode.text.set(`#${this.code}`);
		this.input.classes.add(Classes.Hidden);
		this.pretty.classes.remove(Classes.Hidden);
		this.prettyOverride.classes.add(Classes.Hidden);

		if (Store.items.destinyMembershipOverride)
			delete Store.items.destinyMembershipOverride;
	}

	private async accept () {
		this.input.classes.add(Classes.Hidden);
		this.pretty.classes.remove(Classes.Hidden);

		let searchString = this.input.element.value;
		const searchCode = +searchString.slice(-4);
		if (searchString[searchString.length - 5] !== "#" || isNaN(searchCode))
			return;

		searchString = searchString.slice(0, -5);
		if (searchString === this.displayName && `${searchCode}` === this.code)
			return;

		const destinyMembership = await SearchDestinyPlayerByBungieName.query(searchString, searchCode)
			.then(memberships => getPrimaryDestinyMembership(memberships));
		if (!destinyMembership)
			return this.cancel();

		this.displayName = destinyMembership.bungieGlobalDisplayName;
		this.code = `${destinyMembership.bungieGlobalDisplayNameCode ?? searchCode}`;
		this.prettyUsername.text.set(this.displayName);
		this.prettyCode.text.set(`#${this.code}`);
		this.prettyOverride.classes.remove(Classes.Hidden);
		Store.items.destinyMembershipOverride = destinyMembership;
	}

	@Bound
	private onGlobalKeydown (event: IKeyEvent) {
		if (!document.contains(this.element)) {
			UiEventBus.unsubscribe("keydown", this.onGlobalKeydown);
			return;
		}

		if (!this.input.isFocused())
			return;

		if (event.useOverInput("Escape")) {
			this.cancel();
		}

		if (event.useOverInput("Enter")) {
			void this.accept();
		}
	}
}

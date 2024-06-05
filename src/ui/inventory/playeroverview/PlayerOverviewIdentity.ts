import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Button from "ui/form/Button";
import ProfileManager from "utility/ProfileManager";
import Store from "utility/Store";
import Bound from "utility/decorator/Bound";

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
			.appendTo(this);

		Store.event.subscribe(["setDestinyMembershipOverride", "deleteDestinyMembershipOverride"], this.update);
		this.update();
	}

	@Bound private update () {
		const profile = ProfileManager.get();
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

}

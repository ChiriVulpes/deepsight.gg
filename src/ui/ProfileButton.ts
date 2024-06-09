import { DestinyClass } from "bungie-api-ts/destiny2";
import { InventoryItemHashes } from "deepsight.gg/Enums";
import Manifest from "model/models/Manifest";
import Component from "ui/Component";
import Button from "ui/form/Button";
import type BungieID from "utility/BungieID";
import ProfileManager from "utility/ProfileManager";
import type { IProfileStorage } from "utility/Store";

export enum ProfileButtonClasses {
	Main = "profile-button",
	Emblem = "profile-button-emblem",
	BungieId = "profile-button-bungie-id",
	BungieIdName = "profile-button-bungie-id-name",
	BungieIdCode = "profile-button-bungie-id-code",
	Callsign = "profile-button-callsign",
	Placeholder = "profile-button-placeholder",
	_Authenticated = "profile-button--authenticated",
	_Disabled = "profile-button--disabled",
}

const placeholderEmblem = 4133455811;
const classEmblems: Record<number, number> = {
	[DestinyClass.Hunter]: InventoryItemHashes.HuntersWitEmblem,
	[DestinyClass.Titan]: InventoryItemHashes.TitansPrideEmblem,
	[DestinyClass.Warlock]: InventoryItemHashes.WarlocksFlightEmblem,
};

class ProfileButton extends Button<[bungieId: BungieID, profile?: IProfileStorage]> {
	protected override async onMake (bungieId: BungieID, profile?: IProfileStorage) {
		super.onMake(bungieId, profile);
		this.classes.add(ProfileButtonClasses.Main);
		this.classes.toggle(!!profile?.accessToken, ProfileButtonClasses._Authenticated);

		if (profile && !profile.membershipType && !profile.membershipId && bungieId.code !== -1) {
			profile = await ProfileManager.reinit(bungieId);
			if (!profile)
				this.classes.add(ProfileButtonClasses._Disabled);
		}

		Component.create("span")
			.classes.add(ProfileButtonClasses.BungieId)
			.append(Component.create("span")
				.classes.add(ProfileButtonClasses.BungieIdName)
				.text.set(bungieId.name))
			.append(bungieId.code === -1 ? undefined : Component.create("span")
				.classes.add(ProfileButtonClasses.BungieIdCode)
				.text.set(`#${(bungieId.code).toString().padStart(4, "0")}`))
			.appendTo(this);

		if (profile?.callsign)
			Component.create("span")
				.classes.add(ProfileButtonClasses.Callsign)
				.text.set(`[${profile.callsign}]`)
				.appendTo(this);

		const emblemHash = profile?.emblemHash
			// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
			?? classEmblems[profile?.class!]
			?? placeholderEmblem;

		const { DeepsightEmblemDefinition } = await Manifest.await();
		const def = await DeepsightEmblemDefinition.get(emblemHash);
		if (!def)
			return;

		this.style.set("--colour", `rgb(${def.backgroundColor.red}, ${def.backgroundColor.green}, ${def.backgroundColor.blue})`);

		Component.create()
			.classes.add(ProfileButtonClasses.Emblem)
			.style.set("--icon", `url("https://www.bungie.net${def.displayProperties.icon}")`)
			.prependTo(this);
	}
}

namespace ProfileButton {
	export class Placeholder extends Component {
		protected override onMake (): void {
			this.classes.add(ProfileButtonClasses.Placeholder);
		}
	}
}

export default ProfileButton;

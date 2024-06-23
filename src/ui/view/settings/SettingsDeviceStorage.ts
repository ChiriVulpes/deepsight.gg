import Model from "model/Model";
import Card from "ui/component/Card";
import Component from "ui/component/Component";
import DescribedButton from "ui/component/DescribedButton";

// const membershipNames: Record<BungieMembershipType, string> = {
// 	[BungieMembershipType.None]: "None",
// 	[BungieMembershipType.All]: "All",
// 	[BungieMembershipType.TigerXbox]: "Xbox",
// 	[BungieMembershipType.TigerPsn]: "Playstation",
// 	[BungieMembershipType.TigerSteam]: "Steam",
// 	[BungieMembershipType.TigerBlizzard]: "Blizzard",
// 	[BungieMembershipType.TigerStadia]: "Stadia",
// 	[BungieMembershipType.TigerEgs]: "Epic",
// 	[BungieMembershipType.TigerDemon]: "Demon",
// 	[BungieMembershipType.BungieNext]: "BungieNext",
// };

export default class SettingsDeviceStorage extends Card<[]> {
	protected override onMake () {
		super.onMake();
		this.title.text.set("Account & Storage");

		// Component.create("h1")
		// 	.text.set("If you see this Chiri was bad and forgot to readd something she was too lazy to fix")
		// 	.appendTo(this.content);
		// const memberships = !Bungie.authenticated ? undefined : await Promise.race([Memberships.await(), Async.sleep(5000)]).catch(() => undefined);
		// // if cross save is disabled and there's more than one membership, show a selection for which destiny membership should be viewed
		// if ((memberships?.destinyMemberships.length ?? 0) > 1) {
		// 	const membershipsDropdown = Dropdown.create()
		// 		.addLabel(label => label.text.set("Platform"))
		// 		.tweak(dropdown => memberships!.destinyMemberships.forEach(membership => dropdown.addOption(option => option
		// 			.attributes.set("data-membership-type", `${membership.membershipType}`)
		// 			.text.set(membershipNames[membership.membershipType] ?? "Unknown Membership Type"))))
		// 		.tweak(dropdown => dropdown.options.forEach(option => {
		// 			if (+option.attributes.get("data-membership-type")! as BungieMembershipType === Store.items.destinyMembershipType)
		// 				option.click();
		// 		}))
		// 		.event.subscribe("change", () => {
		// 			Store.items.destinyMembershipType = +membershipsDropdown.activeOption.attributes.get("data-membership-type")! as BungieMembershipType;
		// 			void Profile.reset();
		// 			void Items.reset();
		// 		})
		// 		.appendTo(this.content);
		// }

		DescribedButton.create()
			.tweak(wrapper => wrapper.button.text.set("Clear Destiny Cache"))
			.tweak(wrapper => wrapper.description
				.text.set("Removes the Destiny manifest (a large database of information about the game downloaded from the Bungie.net API), your profile information, and some other misc Destiny data downloaded from other projects. Does not clear your deepsight.gg settings.")
				.append(Component.create("p")
					.append(Component.create("b").text.set("Note:"))
					.text.add(" Continuing to use the app will re-download the deleted data.")))
			.tweak(wrapper => wrapper.button.event.subscribe("click", async () => {
				await Model.clearCache(true);
				location.reload();
			}))
			.appendTo(this.content);

		// if (Bungie.authenticated)
		// 	DescribedButton.create()
		// 		.tweak(wrapper => wrapper.button.text.set("Unauthorise"))
		// 		.tweak(wrapper => wrapper.description.text.set("Forgets your Bungie.net authentication. (Note that the authentication token is not sent anywhere except Bungie.net, and it's stored on your device.)"))
		// 		.tweak(wrapper => wrapper.button.event.subscribe("click", async () => {
		// 			Bungie.resetAuthentication();
		// 			location.reload();
		// 		}))
		// 		.appendTo(this.content);
	}
}

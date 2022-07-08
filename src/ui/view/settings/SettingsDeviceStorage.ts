import Model from "model/Model";
import Card from "ui/Card";
import Component from "ui/Component";
import DescribedButton from "ui/form/DescribedButton";
import LoadingView from "ui/view/LoadingView";
import Bungie from "utility/endpoint/bungie/Bungie";

export default class SettingsDeviceStorage extends Card<[]> {
	protected override onMake (): void {
		super.onMake();
		this.title.text.set("Device Storage");

		DescribedButton.create()
			.tweak(wrapper => wrapper.button.text.set("Clear Destiny Cache"))
			.tweak(wrapper => wrapper.description
				.text.set("Removes the Destiny manifest (a large database of information about the game downloaded from the Bungie.net API), your profile information, and some other misc Destiny data downloaded from other projects. ")
				.append(Component.create("p")
					.append(Component.create("b").text.set("Note:"))
					.text.add(" Continuing to use the app will re-download the deleted data.")))
			.tweak(wrapper => wrapper.button.event.subscribe("click", async () => {
				LoadingView.show();
				await Model.clearCache(true);
				LoadingView.hide();
			}))
			.appendTo(this.content);

		DescribedButton.create()
			.tweak(wrapper => wrapper.button.text.set("Unauthorise"))
			.tweak(wrapper => wrapper.description.text.set("Forgets your Bungie.net authentication. (Note that the authentication token is not sent anywhere except Bungie.net, and it's stored on your device.)"))
			.tweak(wrapper => wrapper.button.event.subscribe("click", async () => {
				LoadingView.show();
				await Model.clearCache(true);
				Bungie.resetAuthentication();
			}))
			.appendTo(this.content);
	}
}

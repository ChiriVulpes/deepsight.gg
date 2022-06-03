import Button from "ui/Button";
import View from "ui/View";
import Bungie from "utility/bungie/Bungie";

export default class SettingsView extends View {

	public static readonly id = "settings";
	public static readonly destinationName = "Settings";

	public getName () {
		return SettingsView.destinationName;
	}

	protected onMakeView (): void {
		Button.create()
			.text.set("Sign Out")
			.event.subscribe("click", () => Bungie.resetAuthentication())
			.appendTo(this.content);
	}
}

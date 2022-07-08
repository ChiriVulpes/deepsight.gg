import View from "ui/View";
import SettingsDeviceStorage from "ui/view/settings/SettingsDeviceStorage";
import SettingsInventoryDisplay from "ui/view/settings/SettingsInventoryDisplay";

export default View.create({
	id: "settings",
	name: "Settings",
	initialiseDestinationButton: button =>
		button.text.remove(),
	initialise: view => view
		.setTitle(title => title.text.set("Settings"))
		.tweak(view => view.content
			.append(SettingsInventoryDisplay.create())
			.append(SettingsDeviceStorage.create())),
});

import View from "ui/View";
import SettingsDeviceStorage from "ui/view/settings/SettingsDeviceStorage";
import SettingsInformationDisplay from "ui/view/settings/SettingsInformationDisplay";

export default View.create({
	id: "settings",
	name: "Settings",
	initialiseDestinationButton: button =>
		button.text.remove(),
	initialise: view => view
		.setTitle(title => title.text.set("Settings"))
		.tweak(view => view.content
			.append(SettingsInformationDisplay.create())
			.append(SettingsDeviceStorage.create())),
});

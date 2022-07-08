import Card from "ui/Card";
import Checkbox from "ui/form/Checkbox";
import Store from "utility/Store";

export default class SettingsInformationDisplay extends Card<[]> {
	protected override onMake (): void {
		super.onMake();
		this.title.text.set("Inventory Display");

		Checkbox.create([Store.items.settingsAlwaysShowExtra])
			.tweak(checkbox => checkbox.label.text.set("Always Show Extra Information"))
			.tweak(checkbox => checkbox.description.text.set("Additional information will always be displayed. On items — the relevant sort information. In tooltips — where applicable, a secondary tooltip detailing content in the main tooltip."))
			.event.subscribe("update", ({ checked }) =>
				Store.items.settingsAlwaysShowExtra = checked ? true : undefined)
			.appendTo(this.content);

		Checkbox.create([!Store.items.settingsClearItemFilterOnSwitchingViews])
			.tweak(checkbox => checkbox.label.text.set("Persistent Item Filter"))
			.tweak(checkbox => checkbox.description.text.set("When reloading the page or switching between views (ie, from Kinetic to Special), any filters are retained."))
			.event.subscribe("update", ({ checked }) =>
				Store.items.settingsClearItemFilterOnSwitchingViews = !checked ? true : undefined)
			.appendTo(this.content);
	}
}

import Card from "ui/Card";
import Component from "ui/Component";
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

		Checkbox.create([Store.items.settingsToggleExtra])
			.tweak(checkbox => checkbox.label.text.set("Toggle Extra Information"))
			.tweak(checkbox => checkbox.description
				.append(Component.create("kbd").text.set("E"))
				.text.add(" toggles whether extra information is displayed, instead of requiring the key to be held."))
			.event.subscribe("update", ({ checked }) =>
				Store.items.settingsToggleExtra = checked ? true : undefined)
			.appendTo(this.content);

		// Checkbox.create([!Store.items.settingsClearItemFilterOnSwitchingViews])
		// 	.tweak(checkbox => checkbox.label.text.set("Persistent Item Filter"))
		// 	.tweak(checkbox => checkbox.description.text.set("When reloading the page or switching between views (ie, from Kinetic to Special), any filters are retained."))
		// 	.event.subscribe("update", ({ checked }) =>
		// 		Store.items.settingsClearItemFilterOnSwitchingViews = !checked ? true : undefined)
		// 	.appendTo(this.content);

		Checkbox.create([Store.items.settingsNoDeepsightBorderOnItemsWithoutPatterns])
			.tweak(checkbox => checkbox.label.text.set("Only Show Deepsight Pattern Border"))
			.tweak(checkbox => checkbox.description.text.set("Items that have deepsight resonance and no pattern to unlock will no longer display with a red border."))
			.event.subscribe("update", ({ checked }) =>
				Store.items.settingsNoDeepsightBorderOnItemsWithoutPatterns = checked ? true : undefined)
			.appendTo(this.content);

		Checkbox.create([Store.items.settingsDisplayWishlistedHighlights])
			.tweak(checkbox => checkbox.label.text.set("Highlight Items Matching Wishlists"))
			.tweak(checkbox => checkbox.description.text.set("Items that exactly match a wishlist you've created will be highlighted with a teal border."))
			.event.subscribe("update", ({ checked }) =>
				Store.items.settingsDisplayWishlistedHighlights = checked ? true : undefined)
			.appendTo(this.content);

		Checkbox.create([!Store.items.settingsDisableDisplayNonWishlistedHighlights])
			.tweak(checkbox => checkbox.label.text.set("Highlight Items Not Matching Wishlists"))
			.tweak(checkbox => checkbox.description.text.set("Items that do not match wishlists you've created will be highlighted with a lime border."))
			.event.subscribe("update", ({ checked }) =>
				Store.items.settingsDisplayWishlistedHighlights = !checked ? true : undefined)
			.appendTo(this.content);
	}
}

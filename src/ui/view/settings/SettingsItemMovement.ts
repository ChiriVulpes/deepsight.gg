import Card from "ui/Card";
import Checkbox from "ui/form/Checkbox";
import Store from "utility/Store";

export default class SettingsItemMovement extends Card<[]> {
	protected override onMake (): void {
		super.onMake();
		this.title.text.set("Item Movement");

		Checkbox.create([!Store.items.settingsDisableReturnOnFailure])
			.tweak(checkbox => checkbox.label.text.set("Return Items to Starting Location on Failure"))
			.tweak(checkbox => checkbox.description.text.set("When moving an item from one character to another, the item is first pulled into the vault. If in the process of moving the item, it fails to complete a step, this causes the item to be put back where it was originally."))
			.event.subscribe("update", ({ checked }) =>
				Store.items.settingsDisableReturnOnFailure = !checked ? true : undefined)
			.appendTo(this.content);
	}
}

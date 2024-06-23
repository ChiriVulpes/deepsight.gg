import type Item from "model/models/items/Item";
import Component from "ui/component/Component";
import { Classes } from "ui/utility/Classes";
import Display from "ui/utility/DisplayProperties";

export enum ItemStatTrackerClasses {
	Main = "item-stat-tracker",
	Icon = "item-stat-tracker-icon",
	Label = "item-stat-tracker-label",
	Value = "item-stat-tracker-value",
}

export default class ItemStatTracker extends Component {

	public icon!: Component;
	public label!: Component;
	public value!: Component;

	protected override onMake (): void {
		this.classes.add(ItemStatTrackerClasses.Main)
			.append(this.icon = Component.create()
				.classes.add(ItemStatTrackerClasses.Icon))
			.append(this.label = Component.create()
				.classes.add(ItemStatTrackerClasses.Label))
			.append(this.value = Component.create()
				.classes.add(ItemStatTrackerClasses.Value));
	}

	public setItem (item: Item) {
		const statTracker = item.getStatTracker();
		this.classes.toggle(!statTracker, Classes.Hidden);
		this.icon.style.set("--icon", Display.icon(statTracker?.definition));
		this.label.text.set(statTracker?.definition.progressDescription ?? Display.name(statTracker?.definition));
		this.value.text.set(`${(statTracker?.progress.progress ?? 0).toLocaleString()}`);
		return this;
	}
}

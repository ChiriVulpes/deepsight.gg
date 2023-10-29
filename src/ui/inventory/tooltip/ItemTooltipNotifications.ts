import type Item from "model/models/items/Item";
import Component from "ui/Component";
import Display from "ui/bungie/DisplayProperties";
import Strings from "utility/Strings";

export enum ItemTooltipNotificationsClasses {
	Main = "item-tooltip-notifications",
	Notification = "item-tooltip-notification",
	NotificationStyle = "item-tooltip-notification-style",
	NotificationIcon = "item-tooltip-notification-icon",
	NotificationDescription = "item-tooltip-notification-description",
}

export default class ItemTooltipPerks extends Component {
	protected override onMake (): void {
		this.classes.add(ItemTooltipNotificationsClasses.Main);
	}

	public setItem (item: Item) {
		this.removeContents();

		for (const index of item.reference.tooltipNotificationIndexes) {
			const notification = item.definition.tooltipNotifications[index];
			if (!notification)
				continue;

			// fragile, but tbf it's only this exact text we don't want to see
			if (notification.displayString.includes("Deepsight activation is available for this weapon."))
				continue;
			if (notification.displayString.includes("Deepsight activation is not available for this weapon instance."))
				continue;
			if (notification.displayString.includes("This weapon's Pattern can be extracted."))
				continue;

			Component.create()
				.classes.add(ItemTooltipNotificationsClasses.Notification)
				.classes.add(`${ItemTooltipNotificationsClasses.NotificationStyle}-${Strings.trimTextMatchingFromStart(notification.displayStyle, "ui_display_style_")}`)
				.append(Component.create()
					.classes.add(ItemTooltipNotificationsClasses.NotificationIcon))
				.append(Component.create()
					.classes.add(ItemTooltipNotificationsClasses.NotificationDescription)
					.tweak(Display.applyDescription, notification.displayString, item.character))
				.appendTo(this);
		}
	}
}

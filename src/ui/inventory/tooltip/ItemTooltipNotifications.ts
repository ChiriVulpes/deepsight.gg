import type Item from "model/models/items/Item";
import Component from "ui/Component";
import Display from "ui/bungie/DisplayProperties";
import Strings from "utility/Strings";

const EXCLUDED_NOTIFICATIONS_SUBSTRINGS = [
	"Deepsight activation is available for this weapon.",
	"Deepsight activation is not available for this weapon instance.",
	"This weapon's Pattern can be extracted.",
	"This weapon can be enhanced.",
	"This weapon can be modified at the Relic.",
	"This weapon is fully enhanced and can be modified at the Relic on Mars.",
	"This weapon can be enhanced further and modified at the Relic on Mars.",
];

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

		for (const index of item.reference.tooltipNotificationIndexes ?? []) {
			const notification = item.definition.tooltipNotifications[index];
			if (!notification)
				continue;

			if (EXCLUDED_NOTIFICATIONS_SUBSTRINGS.some(substring => notification.displayString.includes(substring)))
				continue;

			Component.create()
				.classes.add(ItemTooltipNotificationsClasses.Notification)
				.classes.add(`${ItemTooltipNotificationsClasses.NotificationStyle}-${Strings.trimTextMatchingFromStart(notification.displayStyle, "ui_display_style_")}`)
				.append(Component.create()
					.classes.add(ItemTooltipNotificationsClasses.NotificationIcon))
				.append(Component.create()
					.classes.add(ItemTooltipNotificationsClasses.NotificationDescription)
					.tweak(Display.applyDescription, notification.displayString, item.character?.characterId))
				.appendTo(this);
		}
	}
}

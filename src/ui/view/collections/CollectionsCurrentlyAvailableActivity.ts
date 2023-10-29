import type { DestinyActivityDefinition } from "bungie-api-ts/destiny2";
import { DestinyActivityModeType } from "bungie-api-ts/destiny2";
import type Inventory from "model/models/Inventory";
import Trials from "model/models/Trials";
import type Item from "model/models/items/Item";
import type { ISource } from "model/models/items/Source";
import { SourceType } from "model/models/items/Source";
import Card, { CardClasses } from "ui/Card";
import Component from "ui/Component";
import Timestamp from "ui/Timestamp";
import type { DisplayPropertied } from "ui/bungie/DisplayProperties";
import Display from "ui/bungie/DisplayProperties";
import ICollectionsView from "ui/view/collections/ICollectionsView";

export enum CollectionsCurrentlyAvailableActivityClasses {
	Activity = "view-collections-currently-available-activity",
	ActivityIcon = "view-collections-currently-available-activity-icon",
	ActivityIconContainer = "view-collections-currently-available-activity-icon-container",
	ActivityTitle = "view-collections-currently-available-activity-title",
	ActivityDescription = "view-collections-currently-available-activity-description",
	ActivityRewards = "view-collections-currently-available-activity-rewards",
	ActivityRewardsLong = "view-collections-currently-available-activity-rewards-long",
	ActivityHeader = "view-collections-currently-available-activity-header",
	ActivityHeaderBookmark = "view-collections-currently-available-activity-header-bookmark",
	ActivityHeaderBookmarkIcon = "view-collections-currently-available-activity-header-bookmark-icon",
	ActivityHeaderSubtitle = "view-collections-currently-available-activity-header-subtitle",
	ActivityHeaderSubtitleNote = "view-collections-currently-available-activity-header-subtitle-note",
	ActivityHeaderSubtitleExpiry = "view-collections-currently-available-activity-header-subtitle-expiry",
}

export class CollectionsCurrentlyAvailableActivity extends Card<[activity: DestinyActivityDefinition, source: ISource, activityType: DisplayPropertied | undefined, items: Item[], inventory: Inventory]> {

	protected override onMake (activity: DestinyActivityDefinition, source: ISource, activityType: DisplayPropertied | undefined, items: Item[], inventory: Inventory): void {
		super.onMake(activity, source, activityType, items, inventory);
		this.setDisplayMode(CardClasses.DisplayModeCard);
		this.classes.add(CollectionsCurrentlyAvailableActivityClasses.Activity);

		const icon = source?.dropTable.displayProperties?.icon ?? source?.record?.displayProperties?.icon;

		// wrap the icon in a container so we can make it really big and use overflow hidden on it 
		Component.create()
			.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityIconContainer)
			.append(this.icon.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityIcon)
				.style.set("--icon", Display.icon(icon) ?? Display.icon(activity)))
			.prependTo(this);

		if (activity.hash === Trials.GENERIC_ACTIVITY_HASH)
			void Trials.Map.await().then(activity => activity && this.background.attributes.set("src", `https://www.bungie.net${activity.pgcrImage}`));
		else
			this.background.attributes.set("src", `https://www.bungie.net${activity.pgcrImage}`);

		// ensure fake card header (which contains the card hover sheen and the box shadow contrast reducer border) 
		// is after the icon & background
		this.header.appendTo(this);

		// overwrite header with the real one
		this.header = Component.create()
			.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeader)
			.insertToBefore(this, this.contentWrapper);

		const activityTypeName = undefined
			?? (source?.masterActivityDefinition?.activityModeTypes?.includes(DestinyActivityModeType.ScoredNightfall) ? Display.name(source.masterActivityDefinition.originalDisplayProperties) : undefined)
			?? Display.name(activityType)
			?? "Unknown";

		Component.create()
			.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderBookmark)
			.style.set("--background", `var(--background-${activityTypeName?.toLowerCase().replace(/\W+/g, "-")})`)
			.append(Component.create()
				.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderBookmarkIcon)
				.style.set("--icon", Display.icon(activityType)))
			.appendTo(this.header);

		const note = source.type === SourceType.Rotator ? "Rotator"
			: source.type === SourceType.Repeatable ? "Repeatable"
				: undefined;

		Component.create()
			.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderSubtitle)
			.text.add(activityTypeName)
			.append(note && Component.create("span")
				.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderSubtitleNote)
				.text.add(" \xa0 // \xa0 ")
				.text.add(note))
			.append(!source.endTime ? undefined : Component.create("span")
				.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderSubtitleExpiry)
				.text.add(" \xa0 / \xa0 ")
				.append(Timestamp.create([source.endTime, "relative", { components: 2, label: false }])))
			.appendTo(this.header);

		this.title.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityTitle)
			.text.set(undefined
				?? (activity.activityTypeHash === 2043403989 /* Raid */ || source.masterActivityDefinition?.activityTypeHash === 608898761 /* Dungeon */ ? Display.name(activity.originalDisplayProperties) : undefined)
				?? Display.name(source.dropTable.displayProperties)
				?? Display.name(activity))
			.appendTo(this.content); // the title should be part of the content instead of part of the header

		Component.create()
			.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityDescription)
			.text.set(undefined
				?? Display.description(source.dropTable.displayProperties)
				?? Display.description(activity))
			.appendTo(this.content);

		const rewards = Component.create()
			.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityRewards)
			.classes.toggle(items.length > 10, CollectionsCurrentlyAvailableActivityClasses.ActivityRewardsLong)
			.style.set("--length", `${items.length > 10 ? 8 : items.length}`)
			.appendTo(this.content);

		ICollectionsView.addItems(rewards, items, inventory);
	}
}

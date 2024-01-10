import type { DestinyActivityDefinition } from "bungie-api-ts/destiny2";
import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type { CharacterId } from "model/models/items/Item";
import type { ISource } from "model/models/items/Source";
import { SourceType } from "model/models/items/Source";
import Card, { CardClasses } from "ui/Card";
import Component from "ui/Component";
import Timestamp from "ui/Timestamp";
import type { DisplayPropertied } from "ui/bungie/DisplayProperties";
import Display from "ui/bungie/DisplayProperties";
import ICollectionsView from "ui/view/collections/ICollectionsView";

const moreInfoLinks: Record<string, string | undefined> = {
	nightfall: "https://bray.tech/weeklies#nightfall",
	"lost-sector": "https://bray.tech/weeklies#lost-sector",
	dungeon: "https://bray.tech/weeklies#dungeon",
	raid: "https://bray.tech/weeklies#raid",
};

const rotationLinks: Record<string, string | undefined> = {
	nightfall: "https://bray.tech/weeklies/rotations#nightfall",
	"lost-sector": "https://bray.tech/weeklies/rotations#lost-sector",
	dungeon: "https://bray.tech/weeklies/rotations#dungeon",
	raid: "https://bray.tech/weeklies/rotations#raid",
};

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
	ActivityHeaderSubtitleExpiryLink = "view-collections-currently-available-activity-header-subtitle-expiry-link",
}

export class CollectionsCurrentlyAvailableActivity extends Card<[activity: DestinyActivityDefinition, source: ISource, activityType: DisplayPropertied | undefined, items: Item[], inventory?: Inventory]> {

	protected override onMake (activity: DestinyActivityDefinition, source: ISource, activityType: DisplayPropertied | undefined, items: Item[], inventory?: Inventory): void {
		super.onMake(activity, source, activityType, items, inventory);
		this.setDisplayMode(CardClasses.DisplayModeCard);
		this.classes.add(CollectionsCurrentlyAvailableActivityClasses.Activity);
		this.attributes.set("tabindex", "0");

		const icon = source?.dropTable.displayProperties?.icon;

		// wrap the icon in a container so we can make it really big and use overflow hidden on it 
		Component.create()
			.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityIconContainer)
			.append(this.icon.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityIcon)
				.style.set("--icon", Display.icon(icon) ?? Display.icon(activity)))
			.prependTo(this);

		this.background.attributes.set("src", `https://www.bungie.net${activity.pgcrImage}`);

		// ensure fake card header (which contains the card hover sheen and the box shadow contrast reducer border) 
		// is after the icon & background
		this.header.appendTo(this);

		// overwrite header with the real one
		this.header = Component.create()
			.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeader)
			.insertToBefore(this, this.contentWrapper);

		Component.create()
			.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderBookmark)
			.style.set("--background", `var(--background-${source.dropTable.type})`)
			.append(Component.create()
				.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderBookmarkIcon)
				.style.set("--icon", Display.icon(source.dropTable.typeDisplayProperties) ?? Display.icon(icon) ?? Display.icon(activity)))
			.appendTo(this.header);

		const note = source.type === SourceType.Rotator ? "Rotator"
			: source.type === SourceType.Repeatable ? "Repeatable"
				: undefined;

		let expiryWrapper: Component | undefined;
		Component.create()
			.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderSubtitle)
			.text.add(Display.name(source.dropTable.typeDisplayProperties) ?? "Unknown")
			.append(note && Component.create("span")
				.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderSubtitleNote)
				.text.add(" \xa0 // \xa0 ")
				.text.add(note))
			.append(!source.endTime ? undefined : expiryWrapper = Component.create("span")
				.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderSubtitleExpiry)
				.text.add(" \xa0 / \xa0 "))
			.appendTo(this.header);

		const timestamp = expiryWrapper && Timestamp.create([source.endTime, "relative", { components: 2, label: false }])
			.appendTo(expiryWrapper);

		const rotationLink = expiryWrapper && rotationLinks[source.dropTable.type];
		if (rotationLink)
			Component.create("a")
				.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderSubtitleExpiryLink)
				.attributes.set("href", rotationLink)
				.attributes.set("target", "_blank")
				.append(timestamp)
				.appendTo(expiryWrapper);

		const moreInfoLink = moreInfoLinks[source.dropTable.type];
		if (moreInfoLink)
			this.event.subscribe("contextmenu", () => window.open(moreInfoLink, "_blank"));

		this.title.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityTitle)
			.text.set(undefined
				?? Display.name(source.dropTable.displayProperties)
				?? Display.name(activity))
			.appendTo(this.content); // the title should be part of the content instead of part of the header

		Component.create()
			.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityDescription)
			.tweak(Display.applyDescription,
				(undefined
					?? Display.description(source.dropTable.displayProperties)
					?? Display.description(activity)),
				{
					character: inventory?.currentCharacter.characterId as CharacterId | undefined,
					singleLine: true,
				})
			.appendTo(this.content);

		const rewards = Component.create()
			.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityRewards)
			.classes.toggle(items.length > 10, CollectionsCurrentlyAvailableActivityClasses.ActivityRewardsLong)
			.style.set("--length", `${items.length > 10 ? 8 : items.length}`)
			.appendTo(this.content);

		ICollectionsView.addItems(rewards, items, inventory);
	}
}

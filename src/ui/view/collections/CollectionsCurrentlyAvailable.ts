import { ItemCategoryHashes, type DestinyActivityDefinition, type DestinyCharacterActivitiesComponent } from "bungie-api-ts/destiny2";
import { DestinyActivityModeType } from "bungie-api-ts/destiny2/interfaces";
import type Inventory from "model/models/Inventory";
import type Manifest from "model/models/Manifest";
import type ProfileBatch from "model/models/ProfileBatch";
import type WeaponRotation from "model/models/WeaponRotation";
import Item from "model/models/items/Item";
import type { ISource } from "model/models/items/Source";
import Source from "model/models/items/Source";
import Card, { CardClasses } from "ui/Card";
import Component from "ui/Component";
import Details from "ui/Details";
import type { DisplayPropertied } from "ui/bungie/DisplayProperties";
import Display from "ui/bungie/DisplayProperties";
import { CollectionsMomentClasses } from "ui/view/collections/CollectionsMoment";
import ICollectionsView from "ui/view/collections/ICollectionsView";
import Arrays from "utility/Arrays";
import Objects from "utility/Objects";
import Time from "utility/Time";

export enum CollectionsCurrentlyAvailableClasses {
	Main = "view-collections-currently-available",
	Heading = "view-collections-currently-available-heading",
	ActivityWrapper = "view-collections-currently-available-activity-wrapper",
	ActivityWrapper2 = "view-collections-currently-available-activity-wrapper-2",
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
}

export default class CollectionsCurrentlyAvailable extends Details<[manifest: Manifest, profile: ProfileBatch, weaponRotation: WeaponRotation, inventory: Inventory]> {
	protected override async onMake (manifest: Manifest, profile: ProfileBatch, weaponRotation: WeaponRotation, inventory: Inventory) {
		super.onMake(manifest, profile, weaponRotation, inventory);
		this.classes.add(CollectionsCurrentlyAvailableClasses.Main, CollectionsMomentClasses.Moment);

		this.summary.text.set("Currently Available");
		this.open();

		const activityWrapper = Component.create()
			.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapper)
			.appendTo(this);

		const items = await this.discoverItems(manifest, profile, weaponRotation);

		const sources = items.flatMap(item => item.sources ?? Arrays.EMPTY)
			.flatMap(source => [
				source.isActiveMasterDrop && source.masterActivityDefinition && !source.masterActivityDefinition.activityModeTypes?.includes(DestinyActivityModeType.ScoredNightfall)
					? Arrays.tuple(source.masterActivityDefinition.hash, source.masterActivityDefinition, source)
					: Arrays.tuple(source.activityDefinition.hash, source.activityDefinition, source),
			]);
		// .filter((source): source is [number, DestinyActivityDefinition, ISource] => !!source);

		const { DestinyActivityTypeDefinition, DestinyActivityModeDefinition } = manifest;

		const added = new Set<number>();
		for (const [hash, activity, source] of sources) {
			if (added.has(hash) || added.has(source.activityDefinition.hash))
				continue;

			added.add(hash);

			const sourceItems = items.filter(item => item.sources?.some(source => {
				if (source.activityDefinition.hash === hash)
					return hash in (source.dropTable.dropTable ?? Objects.EMPTY)
						|| source.dropTable.encounters?.some(encounter => hash in (encounter.dropTable ?? Objects.EMPTY))
						|| source.isActiveDrop
						|| false;

				return (source.masterActivityDefinition?.hash === hash && source.isActiveMasterDrop)
					|| false;
			}));

			if (!sourceItems.length)
				continue;

			// eslint-disable-next-line no-constant-condition
			const activityType: DisplayPropertied | undefined = false ? undefined
				// dungeon type doesn't have icon, use mode instead
				: activity.activityTypeHash === 608898761 ? await DestinyActivityModeDefinition.get(608898761)
					: await DestinyActivityTypeDefinition.get(activity.activityTypeHash);

			CollectionsCurrentlyAvailableActivity.create([activity, source, activityType, sourceItems, inventory])
				.event.subscribe("mouseenter", () => console.log(activity?.displayProperties?.name, activity, source))
				.appendTo(activityWrapper);
		}

		activityWrapper.classes.toggle(added.size > 5, CollectionsCurrentlyAvailableClasses.ActivityWrapper2);
	}

	private async discoverItems (manifest: Manifest, profile: ProfileBatch, weaponRotation: WeaponRotation) {
		const itemHashes = new Set<number>();

		for (const hash of Object.values(weaponRotation).flat())
			itemHashes.add(hash);

		const { DeepsightDropTableDefinition, DestinyInventoryItemDefinition, DestinyObjectiveDefinition, DestinyActivityDefinition } = manifest;

		const activities = Object.values<DestinyCharacterActivitiesComponent>(profile.characterActivities?.data ?? Objects.EMPTY)
			.flatMap(activities => activities.availableActivities);

		const dropTables = await DeepsightDropTableDefinition.all();
		for (const source of dropTables) {
			const activity = activities.find(activity => activity.activityHash === source.rotationActivityHash)
				?? activities.find(activity => activity.activityHash === source.hash);

			const masterActivity = !source.master?.activityHash ? undefined :
				activities.find(activity => activity.activityHash === source.master!.activityHash);

			const masterActivityDefinition = await DestinyActivityDefinition.get(masterActivity?.activityHash);

			const challenges = await Promise.all(activity?.challenges?.map(challenge => DestinyObjectiveDefinition.get(challenge.objective.objectiveHash)) ?? []);
			if (challenges.some(Source.isWeeklyChallenge) || masterActivityDefinition?.activityTypeHash === 2043403989 /* Raid */ || masterActivityDefinition?.activityTypeHash === 608898761 /* Dungeon */) {
				for (const dropHash of Object.keys(source.dropTable ?? Objects.EMPTY))
					itemHashes.add(+dropHash);

				for (const encounter of source.encounters ?? [])
					for (const dropHash of Object.keys(encounter.dropTable ?? Objects.EMPTY))
						itemHashes.add(+dropHash);
			}

			if (masterActivity) {
				if (source.rotations) {
					const weeks = Math.floor((Date.now() - (source.rotations?.anchor ?? 0)) / Time.weeks(1));
					const masterDrop = resolveRotation(source.rotations.masterDrops, weeks);
					if (masterDrop)
						itemHashes.add(masterDrop);
				}

				for (const dropHash of Object.keys(source.master?.dropTable ?? Objects.EMPTY))
					itemHashes.add(+dropHash);
			}
		}

		return Promise.all(Array.from(itemHashes).map(hash => Promise.resolve(DestinyInventoryItemDefinition.get(hash))
			.then(def => def && Item.createFake(manifest, profile, def))))
			.then(items => items.filter((item): item is Item =>
				!!(item && item.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon))));
	}
}

function resolveRotation<T> (rotation: T[] | undefined, weeks: number) {
	return !rotation?.length ? undefined : rotation?.[weeks % rotation.length];
}

export class CollectionsCurrentlyAvailableActivity extends Card<[activity: DestinyActivityDefinition, source: ISource, activityType: DisplayPropertied | undefined, items: Item[], inventory: Inventory]> {

	protected override onMake (activity: DestinyActivityDefinition, source: ISource, activityType: DisplayPropertied | undefined, items: Item[], inventory: Inventory): void {
		super.onMake(activity, source, activityType, items, inventory);
		this.setDisplayMode(CardClasses.DisplayModeCard);
		this.classes.add(CollectionsCurrentlyAvailableClasses.Activity);

		const icon = source?.dropTable.displayProperties?.icon ?? source?.record?.displayProperties?.icon;

		// wrap the icon in a container so we can make it really big and use overflow hidden on it 
		Component.create()
			.classes.add(CollectionsCurrentlyAvailableClasses.ActivityIconContainer)
			.append(this.icon.classes.add(CollectionsCurrentlyAvailableClasses.ActivityIcon)
				.style.set("--icon", Display.icon(icon) ?? Display.icon(activity)))
			.prependTo(this);

		this.background.attributes.set("src", `https://www.bungie.net${activity.pgcrImage}`);

		// ensure fake card header (which contains the card hover sheen and the box shadow contrast reducer border) 
		// is after the icon & background
		this.header.appendTo(this);

		// overwrite header with the real one
		this.header = Component.create()
			.classes.add(CollectionsCurrentlyAvailableClasses.ActivityHeader)
			.insertToBefore(this, this.contentWrapper);

		Component.create()
			.classes.add(CollectionsCurrentlyAvailableClasses.ActivityHeaderBookmark)
			.style.set("--background", `var(--background-${Display.name(activityType)?.toLowerCase()})`)
			.append(Component.create()
				.classes.add(CollectionsCurrentlyAvailableClasses.ActivityHeaderBookmarkIcon)
				.style.set("--icon", Display.icon(activityType)))
			.appendTo(this.header);

		const note = undefined
			?? (source.activityChallenges.some(Source.isWeeklyChallenge) ? "Rotator" : undefined)
			?? (activity.activityTypeHash === 2043403989 /* Raid */ || source.masterActivityDefinition?.activityTypeHash === 608898761 /* Dungeon */ ? "Repeatable" : undefined);

		Component.create()
			.classes.add(CollectionsCurrentlyAvailableClasses.ActivityHeaderSubtitle)
			.text.add((source?.masterActivityDefinition?.activityModeTypes?.includes(DestinyActivityModeType.ScoredNightfall) ? Display.name(source.masterActivityDefinition.originalDisplayProperties) : undefined)
				?? Display.name(activityType) ?? "Unknown")
			.append(note && Component.create("span")
				.classes.add(CollectionsCurrentlyAvailableClasses.ActivityHeaderSubtitleNote)
				.text.add(" \xa0 // \xa0 ")
				.text.add(note))
			.appendTo(this.header);

		this.title.classes.add(CollectionsCurrentlyAvailableClasses.ActivityTitle)
			.text.set(undefined
				?? (activity.activityTypeHash === 2043403989 /* Raid */ || source.masterActivityDefinition?.activityTypeHash === 608898761 /* Dungeon */ ? Display.name(activity.originalDisplayProperties) : undefined)
				?? Display.name(activity))
			.appendTo(this.content); // the title should be part of the content instead of part of the header

		Component.create()
			.classes.add(CollectionsCurrentlyAvailableClasses.ActivityDescription)
			.text.set(Display.description(activity))
			.appendTo(this.content);

		const rewards = Component.create()
			.classes.add(CollectionsCurrentlyAvailableClasses.ActivityRewards)
			.classes.toggle(items.length > 10, CollectionsCurrentlyAvailableClasses.ActivityRewardsLong)
			.style.set("--length", `${items.length > 10 ? 8 : items.length}`)
			.appendTo(this.content);

		ICollectionsView.addItems(rewards, items, inventory);
	}
}

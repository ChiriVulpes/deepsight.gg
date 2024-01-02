import { ActivityModeHashes, ActivityTypeHashes } from "@deepsight.gg/enums";
import { type DestinyCharacterActivitiesComponent } from "bungie-api-ts/destiny2";
import type { DestinyObjectiveDefinition } from "bungie-api-ts/destiny2/interfaces";
import { DestinyActivityModeType } from "bungie-api-ts/destiny2/interfaces";
import type Inventory from "model/models/Inventory";
import type Manifest from "model/models/Manifest";
import type ProfileBatch from "model/models/ProfileBatch";
import Item from "model/models/items/Item";
import Source from "model/models/items/Source";
import Details from "ui/Details";
import type { DisplayPropertied } from "ui/bungie/DisplayProperties";
import Paginator from "ui/form/Paginator";
import { CollectionsCurrentlyAvailableActivity } from "ui/view/collections/CollectionsCurrentlyAvailableActivity";
import { CollectionsMomentClasses } from "ui/view/collections/CollectionsMoment";
import Arrays from "utility/Arrays";
import Objects from "utility/Objects";
import Time from "utility/Time";

export enum CollectionsCurrentlyAvailableClasses {
	Main = "view-collections-currently-available",
	Heading = "view-collections-currently-available-heading",
	ActivityWrapperPaginator = "view-collections-currently-available-activity-wrapper-paginator",
	ActivityWrapperPaginatorButton = "view-collections-currently-available-activity-wrapper-paginator-button",
	ActivityWrapper = "view-collections-currently-available-activity-wrapper",
	ActivityWrapperPage = "view-collections-currently-available-activity-wrapper-page",
}

export default class CollectionsCurrentlyAvailable extends Details<[manifest: Manifest, profile?: ProfileBatch, inventory?: Inventory]> {
	protected override async onMake (manifest: Manifest, profile?: ProfileBatch, inventory?: Inventory) {
		super.onMake(manifest, profile, inventory);
		this.classes.add(CollectionsCurrentlyAvailableClasses.Main, CollectionsMomentClasses.Moment);

		this.summary.text.set("Currently Available");
		this.open();

		const items = await this.discoverItems(manifest, profile);

		const sources = items.flatMap(item => item.sources ?? Arrays.EMPTY)
			.flatMap(source => [
				source.isActiveMasterDrop && source.masterActivityDefinition && !source.masterActivityDefinition.activityModeTypes?.includes(DestinyActivityModeType.ScoredNightfall)
					? Arrays.tuple(source.masterActivityDefinition.hash, source.masterActivityDefinition, source)
					: Arrays.tuple(source.activityDefinition.hash, source.activityDefinition, source),
			])
			.sort(([, , a], [, , b]) => a.type - b.type);
		// .filter((source): source is [number, DestinyActivityDefinition, ISource] => !!source);

		const activityWrapper = Paginator.create()
			.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapperPaginator)
			.appendTo(this);

		activityWrapper.pageWrapper.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapper);
		activityWrapper.buttonNext.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapperPaginatorButton);
		activityWrapper.buttonPrev.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapperPaginatorButton);

		const activityFiller = activityWrapper.filler(4, page => page
			.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapperPage));

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
				: activity.activityTypeHash === ActivityTypeHashes.Dungeon ? await DestinyActivityModeDefinition.get(ActivityModeHashes.Dungeon)
					// trials type doesn't have icon, use mode instead
					: activity.activityTypeHash === ActivityTypeHashes.TrialsOfOsiris ? await DestinyActivityModeDefinition.get(ActivityModeHashes.TrialsOfOsiris)
						// lost sector type doesn't have icon, use mode instead
						: activity.activityTypeHash === ActivityTypeHashes.LostSector ? await DestinyActivityModeDefinition.get(ActivityModeHashes.LostSector)
							: await DestinyActivityTypeDefinition.get(activity.activityTypeHash);

			CollectionsCurrentlyAvailableActivity.create([activity, source, activityType, sourceItems, inventory])
				.event.subscribe("mouseenter", () => console.log(activity?.displayProperties?.name, activity, source))
				.appendTo(activityFiller.increment());
		}
	}

	private async discoverItems (manifest: Manifest, profile?: ProfileBatch) {
		const itemHashes = new Set<number>();

		const { DeepsightDropTableDefinition, DestinyInventoryItemDefinition, DestinyObjectiveDefinition, DestinyActivityDefinition } = manifest;

		const availableActivities = Object.values<DestinyCharacterActivitiesComponent>(profile?.characterActivities?.data ?? Objects.EMPTY)
			.flatMap(activities => activities.availableActivities);

		const dropTables = await DeepsightDropTableDefinition.all();
		for (const source of dropTables) {
			const activityInstances = availableActivities.filter(activity => activity.activityHash === source.rotationActivityHash);
			if (!activityInstances.length)
				activityInstances.push(...availableActivities.filter(activity => activity.activityHash === source.hash));

			const masterActivity = !source.master?.activityHash ? undefined
				: availableActivities.find(activity => activity.activityHash === source.master!.activityHash);

			const masterActivityDefinition = await DestinyActivityDefinition.get(masterActivity?.activityHash);

			const activityChallengeStates = activityInstances.flatMap(activity => activity?.challenges ?? []);
			const activityChallenges = (await Promise.all(activityChallengeStates.map(challenge => DestinyObjectiveDefinition.get(challenge.objective.objectiveHash))))
				.filter((challenge): challenge is DestinyObjectiveDefinition => !!challenge);

			const intervals = Math.floor((Date.now() - new Date(source.rotations?.anchor ?? 0).getTime())
				/ (source.rotations?.interval === "daily" ? Time.days(1) : Time.weeks(1)));

			if (source.availability || activityChallenges.some(Source.isWeeklyChallenge) || masterActivityDefinition?.activityTypeHash === ActivityTypeHashes.Raid || masterActivityDefinition?.activityTypeHash === ActivityTypeHashes.Dungeon) {
				for (const dropHash of Object.keys(source.dropTable ?? Objects.EMPTY))
					itemHashes.add(+dropHash);

				for (const encounter of source.encounters ?? [])
					for (const dropHash of Object.keys(encounter.dropTable ?? Objects.EMPTY))
						itemHashes.add(+dropHash);

				if (source.rotations) {
					const drop = resolveRotation(source.rotations.drops, intervals);
					if (typeof drop === "number")
						itemHashes.add(drop);
					else if (typeof drop === "object")
						for (const id of Object.keys(drop))
							itemHashes.add(+id);
				}
			}

			if (masterActivity) {
				if (source.rotations) {
					const masterDrop = resolveRotation(source.rotations.masterDrops, intervals);
					if (typeof masterDrop === "number")
						itemHashes.add(masterDrop);
					else if (typeof masterDrop === "object")
						for (const id of Object.keys(masterDrop))
							itemHashes.add(+id);
				}

				for (const dropHash of Object.keys(source.master?.dropTable ?? Objects.EMPTY))
					itemHashes.add(+dropHash);
			}
		}

		return Promise.all(Array.from(itemHashes).map(hash => Promise.resolve(DestinyInventoryItemDefinition.get(hash))
			.then(def => def && Item.createFake(manifest, profile ?? {}, def))))
			.then(items => items.filter((item): item is Item => !!item?.isWeapon()));
	}
}

function resolveRotation<T> (rotation: T[] | undefined, interval: number) {
	return !rotation?.length ? undefined : rotation?.[interval % rotation.length];
}

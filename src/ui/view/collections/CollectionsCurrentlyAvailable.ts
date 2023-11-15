import { type DestinyCharacterActivitiesComponent } from "bungie-api-ts/destiny2";
import { DestinyActivityModeType } from "bungie-api-ts/destiny2/interfaces";
import type Inventory from "model/models/Inventory";
import type Manifest from "model/models/Manifest";
import type ProfileBatch from "model/models/ProfileBatch";
import Trials from "model/models/Trials";
import type WeaponRotation from "model/models/WeaponRotation";
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

export default class CollectionsCurrentlyAvailable extends Details<[manifest: Manifest, profile?: ProfileBatch, weaponRotation?: WeaponRotation, inventory?: Inventory]> {
	protected override async onMake (manifest: Manifest, profile?: ProfileBatch, weaponRotation?: WeaponRotation, inventory?: Inventory) {
		super.onMake(manifest, profile, weaponRotation, inventory);
		this.classes.add(CollectionsCurrentlyAvailableClasses.Main, CollectionsMomentClasses.Moment);

		this.summary.text.set("Currently Available");
		this.open();

		const items = await this.discoverItems(manifest, profile, weaponRotation);

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
				: activity.activityTypeHash === 608898761 ? await DestinyActivityModeDefinition.get(608898761)
					// trials type doesn't have icon, use mode instead
					: activity.hash === Trials.GENERIC_ACTIVITY_HASH ? await DestinyActivityModeDefinition.get(activity.directActivityModeHash)
						: await DestinyActivityTypeDefinition.get(activity.activityTypeHash);

			CollectionsCurrentlyAvailableActivity.create([activity, source, activityType, sourceItems, inventory])
				.event.subscribe("mouseenter", () => console.log(activity?.displayProperties?.name, activity, source))
				.appendTo(activityFiller.increment());
		}
	}

	private async discoverItems (manifest: Manifest, profile?: ProfileBatch, weaponRotation?: WeaponRotation) {
		const itemHashes = new Set<number>();

		for (const hash of Object.values(weaponRotation ?? Objects.EMPTY).flat())
			itemHashes.add(hash as number);

		const { DeepsightDropTableDefinition, DestinyInventoryItemDefinition, DestinyObjectiveDefinition, DestinyActivityDefinition } = manifest;

		const activities = Object.values<DestinyCharacterActivitiesComponent>(profile?.characterActivities?.data ?? Objects.EMPTY)
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
			.then(def => def && Item.createFake(manifest, profile ?? {}, def))))
			.then(items => items.filter((item): item is Item => !!item?.isWeapon()));
	}
}

function resolveRotation<T> (rotation: T[] | undefined, weeks: number) {
	return !rotation?.length ? undefined : rotation?.[weeks % rotation.length];
}

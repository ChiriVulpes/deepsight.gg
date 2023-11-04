import type { DestinyActivityDefinition, DestinyInventoryItemDefinition, DestinyObjectiveDefinition } from "bungie-api-ts/destiny2";
import { DestinyActivityModeType, type DestinyActivity, type DestinyActivityModifierDefinition, type DestinyCharacterActivitiesComponent, type DestinyRecordDefinition, type DictionaryComponentResponse } from "bungie-api-ts/destiny2/interfaces";
import type { BungieIconPath, DeepsightDropTableDefinition } from "manifest.deepsight.gg";
import Activities from "model/models/Activities";
import type Manifest from "model/models/Manifest";
import Trials from "model/models/Trials";
import WeaponRotation from "model/models/WeaponRotation";
import type { IItemInit } from "model/models/items/Item";
import Objects from "utility/Objects";
import Time from "utility/Time";
import Bungie from "utility/endpoint/bungie/Bungie";
import { VendorHashes } from "utility/endpoint/bungie/endpoint/destiny2/GetVendor";

export enum SourceType {
	Playlist,
	Rotator,
	Repeatable,
}

export interface ISource {
	dropTable: DeepsightDropTableDefinition;
	activity?: DestinyActivity;
	activityDefinition: DestinyActivityDefinition;
	activityChallenges: DestinyObjectiveDefinition[];
	masterActivityDefinition?: DestinyActivityDefinition;
	masterActivity?: DestinyActivity | true;
	activeChallenge?: DestinyActivityModifierDefinition;
	isActiveDrop: boolean;
	isActiveMasterDrop: boolean;
	record?: DestinyRecordDefinition;
	type: SourceType;
	endTime?: number;
	requiresQuest?: DestinyInventoryItemDefinition | null;
	requiresItems?: (DestinyInventoryItemDefinition | null)[];
}

namespace Source {

	export interface ISourceProfile {
		characterActivities?: DictionaryComponentResponse<DestinyCharacterActivitiesComponent>;
	}

	export async function apply (manifest: Manifest, profile: ISourceProfile, item: IItemInit) {
		if (item.bucket !== "collections")
			return;

		item.sources = await resolve(manifest, profile, item);
	}

	async function resolve (manifest: Manifest, profile: ISourceProfile, item: IItemInit): Promise<ISource[] | undefined> {
		const dropTableSources = await resolveDropTables(manifest, profile, item);
		const weaponRotationSources = await resolveWeaponRotation(manifest, profile, item);
		if (!dropTableSources?.length && !weaponRotationSources.size)
			return undefined;

		return [...dropTableSources ?? [], ...weaponRotationSources.values()];
	}

	async function resolveWeaponRotation (manifest: Manifest, profile: ISourceProfile, item: IItemInit) {
		const sources = new Map<number, ISource>();

		const { DestinyActivityDefinition, DestinyActivityModeDefinition } = manifest;
		const activities = await DestinyActivityDefinition.all();
		const availableActivities = await Activities.await();

		const weaponRotation = await WeaponRotation.await();
		for (const [vendor, itemHashes] of Object.entries(weaponRotation) as any[] as [VendorHashes, number[]][]) {
			if (!itemHashes.includes(item.definition.hash))
				continue;

			const vendorActivities = await resolveVendorActivities(manifest, profile, vendor);

			for (const activity of vendorActivities) {
				const adept = item.definition.displayProperties.name.trimEnd().endsWith("(Adept)");
				const activityAwardsAdept = activity.rewards.some(reward => reward.rewardItems
					.some(item => item.itemHash === 2119974556 || item.itemHash === Trials.ADEPT_WEAPON_REWARD_HASH));

				if (adept !== activityAwardsAdept && !activity.activityModeTypes?.includes(DestinyActivityModeType.TrialsOfOsiris))
					continue;

				if (activityAwardsAdept && activity.activityModeTypes?.includes(DestinyActivityModeType.ScoredNightfall)) {
					const hasWeeklyNightfall = availableActivities.some(a => a.hash !== activity.hash
						&& a.displayProperties.description === activity.displayProperties.description
						&& a.originalDisplayProperties.name === "Nightfall");
					if (!hasWeeklyNightfall)
						continue;
				}

				let rootActivity: DestinyActivityDefinition | undefined;
				if (activity.activityModeTypes?.includes(DestinyActivityModeType.ScoredNightfall))
					rootActivity = activities.find(a => a.activityModeTypes?.includes(DestinyActivityModeType.Strike)
						&& a.displayProperties.name === activity.displayProperties.description);

				let dropTable: DeepsightDropTableDefinition = { hash: activity.hash };

				if (activity.activityModeTypes?.includes(DestinyActivityModeType.ScoredNightfall))
					dropTable = {
						...dropTable,
						displayProperties: {
							icon: "./image/png/activity/strike.png",
						},
					};
				else if (activity.activityModeTypes?.includes(DestinyActivityModeType.TrialsOfOsiris))
					dropTable = {
						...dropTable,
						displayProperties: {
							icon: (await DestinyActivityModeDefinition.get(activity.directActivityModeHash))?.displayProperties.icon as BungieIconPath | undefined,
						},
					};

				sources.set(activity.hash, {
					dropTable: dropTable,
					activityChallenges: [],
					activityDefinition: rootActivity ?? activity,
					masterActivity: activityAwardsAdept ? true : undefined,
					masterActivityDefinition: activity,
					isActiveDrop: true,
					isActiveMasterDrop: activityAwardsAdept,
					type: SourceType.Playlist,
					endTime: Bungie.nextWeeklyReset,
				});
			}
		}

		return sources;
	}

	const vendorActivityTypeHashMap: Partial<Record<VendorHashes, number>> = {
		[VendorHashes.CommanderZavala]: 575572995,
		[VendorHashes.Saint14]: 2112637710,
	};
	async function resolveVendorActivities (manifest: Manifest, profile: ISourceProfile, vendor: VendorHashes) {
		return (await Activities.await())
			.filter(activity => activity?.activityTypeHash === vendorActivityTypeHashMap[vendor]);
	}

	async function resolveDropTables (manifest: Manifest, profile: ISourceProfile, item: IItemInit) {
		const { DeepsightDropTableDefinition } = manifest;
		let dropTables = await DeepsightDropTableDefinition.all();
		dropTables = dropTables.filter(table => false
			|| table.dropTable?.[item.definition.hash]
			|| table.encounters?.some(encounter => encounter.dropTable?.[item.definition.hash])
			|| table.master?.dropTable?.[item.definition.hash]
			|| table.rotations?.drops?.includes(item.definition.hash)
			|| table.rotations?.masterDrops?.includes(item.definition.hash));

		if (!dropTables.length)
			return undefined;

		return Promise.all(dropTables.map(table => resolveDropTable(manifest, profile, table, item)));
	}

	async function resolveDropTable (manifest: Manifest, profile: ISourceProfile, table: DeepsightDropTableDefinition, item: IItemInit): Promise<ISource> {
		const { DestinyActivityDefinition, DestinyRecordDefinition, DestinyActivityModifierDefinition, DestinyObjectiveDefinition, DestinyInventoryItemDefinition } = manifest;

		const weeks = Math.floor((Date.now() - (table.rotations?.anchor ?? 0)) / Time.weeks(1));

		const availableActivities = Object.values<DestinyCharacterActivitiesComponent>(profile.characterActivities?.data ?? Objects.EMPTY)
			.flatMap(activities => activities.availableActivities);

		const activity = availableActivities.find(activity => activity.activityHash === table.rotationActivityHash)
			?? availableActivities.find(activity => activity.activityHash === table.hash);

		const activityChallenges = (await Promise.all(activity?.challenges?.map(challenge => DestinyObjectiveDefinition.get(challenge.objective.objectiveHash)) ?? []))
			.filter((challenge): challenge is DestinyObjectiveDefinition => !!challenge);

		const masterActivity = !table.master?.activityHash ? undefined : availableActivities
			.find(activity => activity.activityHash === table.master!.activityHash);

		const activityDefinition = await DestinyActivityDefinition.get(table.hash);
		const masterActivityDefinition = await DestinyActivityDefinition.get(table.master?.activityHash);

		const type = undefined
			?? (activityChallenges.some(Source.isWeeklyChallenge) ? SourceType.Rotator : undefined)
			?? (activityDefinition?.activityTypeHash === 2043403989 /* Raid */ || masterActivityDefinition?.activityTypeHash === 608898761 /* Dungeon */ ? SourceType.Repeatable : undefined)
			?? SourceType.Playlist;

		const dropDef = table.dropTable?.[item.definition.hash]
			?? table.encounters?.find(encounter => encounter.dropTable?.[item.definition.hash])?.dropTable?.[item.definition.hash]
			?? table.master?.dropTable?.[item.definition.hash];

		const isRotationDrop = resolveRotation(table.rotations?.drops, weeks) === item.definition.hash;
		const isMasterRotationDrop = resolveRotation(table.rotations?.masterDrops, weeks) === item.definition.hash;

		const isMaster = !!table.master?.dropTable?.[item.definition.hash] || isMasterRotationDrop;

		const isRotatingChallengeRelevant = isMaster
			? isMasterRotationDrop || !table.rotations?.masterDrops
			: isRotationDrop || !table.rotations?.drops;

		return {
			dropTable: table,
			activity,
			activityDefinition: activityDefinition!,
			activityChallenges,
			masterActivityDefinition,
			masterActivity,
			activeChallenge: !isRotatingChallengeRelevant ? undefined
				: await DestinyActivityModifierDefinition.get(resolveRotation(table.rotations?.challenges, weeks)),
			isActiveDrop: table.rotations?.drops ? isRotationDrop
				: activityChallenges.some(isWeeklyChallenge) || !!masterActivity,
			isActiveMasterDrop: isMaster,
			record: await DestinyRecordDefinition.get(table.recordHash),
			type,
			endTime: type === SourceType.Rotator ? Bungie.nextWeeklyReset : undefined,
			requiresQuest: !dropDef?.requiresQuest ? undefined : (await DestinyInventoryItemDefinition.get(dropDef.requiresQuest) ?? null),
			requiresItems: !dropDef?.requiresItems?.length ? undefined : await Promise.all(dropDef.requiresItems.map(async hash => (await DestinyInventoryItemDefinition.get(hash)) ?? null)),
		};
	}

	function resolveRotation<T> (rotation: T[] | undefined, weeks: number) {
		return !rotation?.length ? undefined : rotation?.[weeks % rotation.length];
	}

	export function isWeeklyChallenge (objective?: DestinyObjectiveDefinition): objective is DestinyObjectiveDefinition {
		return objective?.displayProperties?.name === "Weekly Dungeon Challenge"
			|| objective?.displayProperties?.name === "Weekly Raid Challenge";
	}
}

export default Source;

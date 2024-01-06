import { ActivityModeHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition } from "@deepsight.gg/interfaces";
import type { DestinyActivityDefinition, DestinyInventoryItemDefinition, DestinyObjectiveDefinition } from "bungie-api-ts/destiny2";
import { type DestinyActivityModifierDefinition, type DestinyCharacterActivitiesComponent, type DictionaryComponentResponse } from "bungie-api-ts/destiny2/interfaces";
import type Manifest from "model/models/Manifest";
import type { IItemInit } from "model/models/items/Item";
import Bungie from "utility/endpoint/bungie/Bungie";

export enum SourceType {
	Playlist,
	Rotator,
	Repeatable,
}

export interface ISource {
	dropTable: DeepsightDropTableDefinition;
	activityDefinition: DestinyActivityDefinition;
	masterActivityDefinition?: DestinyActivityDefinition;
	activeChallenge?: DestinyActivityModifierDefinition;
	isActiveDrop: boolean;
	isActiveMasterDrop: boolean;
	type: SourceType;
	endTime?: number;
	requiresQuest?: DestinyInventoryItemDefinition | null;
	requiresItems?: (DestinyInventoryItemDefinition | null)[];
	purchaseOnly?: true;
}

namespace Source {

	export interface ISourceProfile {
		characterActivities?: DictionaryComponentResponse<DestinyCharacterActivitiesComponent>;
	}

	export async function apply (manifest: Manifest, profile: ISourceProfile, item: IItemInit) {
		if (!item.bucket.isCollections())
			return;

		item.sources = await resolve(manifest, profile, item);
	}

	async function resolve (manifest: Manifest, profile: ISourceProfile, item: IItemInit): Promise<ISource[] | undefined> {
		const dropTableSources = await resolveDropTables(manifest, profile, item);
		if (!dropTableSources?.length)
			return undefined;

		return dropTableSources ?? [];
	}

	async function resolveDropTables (manifest: Manifest, profile: ISourceProfile, item: IItemInit) {
		const { DeepsightDropTableDefinition } = manifest;
		let dropTables = await DeepsightDropTableDefinition.all();
		dropTables = dropTables.filter(table => false
			|| table.dropTable?.[item.definition.hash]
			|| table.encounters?.some(encounter => encounter.dropTable?.[item.definition.hash])
			|| table.master?.dropTable?.[item.definition.hash]
			|| table.rotations?.drops?.some(drop => drop === item.definition.hash || typeof drop === "object" && item.definition.hash in drop)
			|| table.rotations?.masterDrops?.some(drop => drop === item.definition.hash || typeof drop === "object" && item.definition.hash in drop));

		if (!dropTables.length)
			return undefined;

		return Promise.all(dropTables.map(table => resolveDropTable(manifest, profile, table, item)));
	}

	async function resolveDropTable (manifest: Manifest, profile: ISourceProfile, table: DeepsightDropTableDefinition, item: IItemInit): Promise<ISource> {
		const { DestinyActivityDefinition, DestinyActivityModifierDefinition, DestinyInventoryItemDefinition } = manifest;

		const intervals = table.rotations?.current ?? 0;

		const activityDefinition = await DestinyActivityDefinition.get(table.hash);
		const masterActivityDefinition = await DestinyActivityDefinition.get(table.master?.activityHash);

		const type = undefined
			?? (table.availability === "rotator" ? SourceType.Rotator : undefined)
			?? (table.availability === "repeatable" ? SourceType.Repeatable : undefined)
			?? SourceType.Playlist;

		const dropDef = table.dropTable?.[item.definition.hash]
			?? table.encounters?.find(encounter => encounter.dropTable?.[item.definition.hash])?.dropTable?.[item.definition.hash]
			?? table.master?.dropTable?.[item.definition.hash];

		const rotatedDrop = resolveRotation(table.rotations?.drops, intervals);
		const isRotationDrop = rotatedDrop === item.definition.hash || typeof rotatedDrop === "object" && item.definition.hash in rotatedDrop;
		const rotatedMasterDrop = resolveRotation(table.rotations?.masterDrops, intervals);
		const isMasterRotationDrop = rotatedMasterDrop === item.definition.hash || typeof rotatedMasterDrop === "object" && item.definition.hash in rotatedMasterDrop;

		const isMaster = !!table.master?.dropTable?.[item.definition.hash] || isMasterRotationDrop;

		const isRotatingChallengeRelevant = table.availability === "rotator" ? false
			: isMaster
				? isMasterRotationDrop || !table.rotations?.masterDrops
				: isRotationDrop || !table.rotations?.drops;

		return {
			dropTable: table,
			activityDefinition: activityDefinition!,
			masterActivityDefinition,
			activeChallenge: !isRotatingChallengeRelevant ? undefined
				: await DestinyActivityModifierDefinition.get(resolveRotation(table.rotations?.challenges, intervals)),
			isActiveDrop: (!!table.rotations?.drops && isRotationDrop)
				|| (!!table.availability && !!activityDefinition?.activityModeHashes?.includes(ActivityModeHashes.Strikes)),
			isActiveMasterDrop: !!table.master?.availability && isMaster,
			type,
			endTime: table.endTime ? new Date(table.endTime).getTime() : type === SourceType.Rotator ? Bungie.nextWeeklyReset : undefined,
			requiresQuest: !dropDef?.requiresQuest ? undefined : (await DestinyInventoryItemDefinition.get(dropDef.requiresQuest) ?? null),
			requiresItems: !dropDef?.requiresItems?.length ? undefined : await Promise.all(dropDef.requiresItems.map(async hash => (await DestinyInventoryItemDefinition.get(hash)) ?? null)),
			purchaseOnly: dropDef?.purchaseOnly,
		};
	}

	function resolveRotation<T> (rotation: T[] | undefined, intervals: number) {
		return !rotation?.length ? undefined : rotation?.[intervals % rotation.length];
	}

	export function isWeeklyChallenge (objective?: DestinyObjectiveDefinition): objective is DestinyObjectiveDefinition {
		return objective?.displayProperties?.name === "Weekly Dungeon Challenge"
			|| objective?.displayProperties?.name === "Weekly Raid Challenge";
	}
}

export default Source;

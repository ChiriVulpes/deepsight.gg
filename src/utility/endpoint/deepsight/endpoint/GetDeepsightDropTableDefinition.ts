import type { DestinyDisplayPropertiesDefinition } from "bungie-api-ts/destiny2";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export interface DeepsightDropTableDefinition {
	/**
	 * `DestinyActivityDefinition` hash.
	 * Refers to the version of the raid that's always available.
	 */
	hash: number;
	/**
	 * `DestinyActivityDefinition` hash.
	 * Refers to the version of the raid that rotates in and has all challenges available (if different.)
	 */
	rotationActivityHash?: number;
	/**
	 * A record for completing this activity.
	 */
	recordHash?: number;
	/**
	 * Partial display properties. Not all fields are guaranteed to be provided.
	 */
	displayProperties?: Partial<DestinyDisplayPropertiesDefinition>;
	/**
	 * A drop table used as the base drop table for all encounters. Encounter-specific drop tables may override this.
	 */
	dropTable?: Record<number, DeepsightDropTableDropDefinition>;
	/**
	 * If this activity has encounters, information about them will be here.
	 */
	encounters?: DeepsightDropTableEncounterDefinition[];
	/**
	 * If the activity has a high level variant which drops different loot, it's defined here.
	 */
	master?: DeepsightDropTableMasterDefinition;
	/**
	 * If challenges or drops rotate, this field will be filled.
	 */
	rotations?: DeepsightDropTableRotationsDefinition;
}

export interface DeepsightDropTableEncounterDefinition {
	/**
	 * Phase hashes are based on data from `characterProgressions.milestones[milestone hash].activities[activity index].phases`
	 */
	phaseHash: number;
	/**
	 * Every encounter is guaranteed to have a partial display properties object.
	 */
	displayProperties: Partial<DestinyDisplayPropertiesDefinition>;
	/**
	 * Determines the way that this encounter's drop table should be applied to the base activity drop table.
	 * - "replace" = this encounter-specific drop table should be used instead of the base drop table.
	 * - "merge" = this encounter-specific drop table should be merged into the base drop table.
	 * If not provided, it should default to "merge". 
	 */
	dropTableMergeStrategy?: "replace" | "merge";
	/**
	 * Encounter-specific drop table.
	 */
	dropTable?: Record<number, DeepsightDropTableDropDefinition>;
}

export interface DeepsightDropTableMasterDefinition {
	/**
	 * `DestinyActivityDefinition` hash for the master activity.
	 */
	activityHash: number;
	/**
	 * A non-rotating drop table of items from the master activity.
	 */
	dropTable?: Record<number, DeepsightDropTableDropDefinition>;
}

export interface DeepsightDropTableDropDefinition {
	/**
	 * `DestinyInventoryItemDefinition` hash representing a quest item required for this drop to drop.
	 */
	requiresQuest?: number;
	/**
	 * `DestinyInventoryItemDefinition` hashes representing a list of items required for this drop to drop.
	 */
	requiresItems?: number[];
}

export interface DeepsightDropTableRotationsDefinition {
	/**
	 * Unix timestamp (ms) of a Destiny reset, referring to the following week's rotation.
	 */
	anchor: number;
	/**
	 * `DestinyInventoryItemDefinition` hashes.
	 * The first drop will be the active drop during the week of the anchor reset, then the next drop the next week,
	 * and so on until all drops are exhausted. At that point, it cycles back to the first drop.
	 */
	drops?: number[];
	/**
	 * `DestinyInventoryItemDefinition` hashes.
	 * The first drop will be the active drop during the week of the anchor reset, then the next drop the next week,
	 * and so on until all drops are exhausted. At that point, it cycles back to the first drop.
	 */
	masterDrops?: number[];
	/**
	 * `DestinyActivityModifierDefinition` hashes.
	 * The first challenge will be the active challenge during the week of the anchor reset, then the next challenge the next week,
	 * and so on until all challenges are exhausted. At that point, it cycles back to the first challenge.
	 */
	challenges?: number[];
}

export default new DeepsightEndpoint("DeepsightDropTableDefinition.json", {
	process (received: Record<number, DeepsightDropTableDefinition>) {
		const result: Record<number, DeepsightDropTableDefinition> = {};
		for (const [hash, definition] of Object.entries(received))
			result[+hash] = { ...definition, hash: +hash };
		return result;
	},
});

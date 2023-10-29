import type { DestinyDisplayPropertiesDefinition } from "bungie-api-ts/destiny2";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export interface DeepsightDropTableDefinition {
	/**
	 * `DestinyActivityDefinition` hashes
	 * 
	 * Should be referring to the version of the raid that's always available
	 */
	hash: number;
	/**
	 * `DestinyActivityDefinition` hashes
	 * 
	 * Should be referring to the version of the raid that rotates in and has all challenges available
	 */
	rotationActivityHash?: number;
	/**
	 * `DestinyRecordDefinition` hashes
	 * 
	 * This is solely used for the raid icon in tooltips, if the activity icon is the raid icon already this isn't necessary
	 */
	iconRecordHash?: number;
	/**
	 * A drop table used by default for all encounters
	 */
	dropTable?: Record<number, object>;
	encounters?: DeepsightDropTableEncounterDefinition[];
	/**
	 * If the activity has a high level variant which drops different loot, it's defined here
	 */
	master?: DeepsightDropTableMasterDefinition;
	/**
	 * If challenges or drops rotate, this field will be filled
	 */
	rotations?: DeepsightDropTableRotationsDefinition;
	displayProperties?: Partial<DestinyDisplayPropertiesDefinition> & {
		iconBlack?: true;
	};
}

export interface DeepsightDropTableEncounterDefinition {
	/**
	 * Phase hashes are based on data from `characterProgressions.milestones[milestone hash].activities[activity index].phases`
	 */
	phaseHash: number;
	displayProperties: DestinyDisplayPropertiesDefinition;
	/**
	 * Defaults to "merge"
	 */
	dropTableMergeStrategy?: "replace" | "merge";
	dropTable?: Record<number, object>;
}

export interface DeepsightDropTableMasterDefinition {
	/**
	 * `DestinyActivityDefinition` hashes
	 */
	activityHash: number;
	/**
	 * Non-rotating drop table
	 */
	dropTable?: Record<number, object>;
}

export interface DeepsightDropTableRotationsDefinition {
	/**
	 * ms based time occurring after a reset, indicating that this week is where the rotations begin
	 */
	anchor: number;
	/**
	 * `DestinyInventoryItemDefinition` hashes
	 */
	drops?: number[];
	/**
	 * `DestinyInventoryItemDefinition` hashes
	 */
	masterDrops?: number[];
	/**
	 * `DestinyActivityModifierDefinition` hashes
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

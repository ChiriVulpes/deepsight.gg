import type { DestinyDisplayPropertiesDefinition } from "bungie-api-ts/destiny2";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export interface DeepsightDropTableDefinition {
	hash: number;
	recordHash?: number;
	rotationActivityHash?: number;
	phases: DeepsightDropTablePhaseDefinition[];
	master?: DeepsightDropTableMasterDefinition;
}

export interface DeepsightDropTablePhaseDefinition {
	hash: number;
	displayProperties: DestinyDisplayPropertiesDefinition;
	dropTable: Record<number, object>;
}

export interface DeepsightDropTableMasterDefinition {
	activityHash: number;
	challengeDropTable?: Record<number, object>;
	challengeRotations: DeepsightDropTableMasterRotationsDefinition;
}

export interface DeepsightDropTableMasterRotationsDefinition {
	/**
	 * ms based time occurring after a reset, indicating that this week is where the rotations begin
	 */
	anchor: number;
	/**
	 * `DestinyInventoryItemDefinition` hashes
	 */
	drops?: number[];
	/**
	 * `DestinyActivityModifierDefinition` hashes
	 */
	challenges: number[];
}

export default new DeepsightEndpoint("DeepsightDropTableDefinition.json", {
	process (received: Record<number, DeepsightDropTableDefinition>) {
		const result: Record<number, DeepsightDropTableDefinition> = {};
		for (const [hash, definition] of Object.entries(received))
			result[+hash] = { ...definition, hash: +hash };
		return result;
	},
});

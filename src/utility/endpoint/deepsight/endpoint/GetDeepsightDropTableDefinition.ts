import type { DestinyDisplayPropertiesDefinition } from "bungie-api-ts/destiny2";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export interface DeepsightDropTableDefinition {
	hash: number;
	recordHash?: number;
	rotationActivityHash?: number;
	phases: DeepsightDropTablePhaseDefinition[];
	master?: {
		activityHash: number;
		challengeDropTable: Record<number, object>;
	}
}

export interface DeepsightDropTablePhaseDefinition {
	hash: number;
	displayProperties: DestinyDisplayPropertiesDefinition;
	dropTable: Record<number, object>;
}

export default new DeepsightEndpoint("DeepsightDropTableDefinition.json", {
	process (received: Record<number, DeepsightDropTableDefinition>) {
		const result: Record<number, DeepsightDropTableDefinition> = {};
		for (const [hash, definition] of Object.entries(received))
			result[+hash] = { ...definition, hash: +hash };
		return result;
	},
});

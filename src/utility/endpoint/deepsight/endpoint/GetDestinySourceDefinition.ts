import type { DestinyDisplayPropertiesDefinition } from "bungie-api-ts/destiny2";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export interface DestinySourceDefinition {
	id: string;
	displayProperties: DestinyDisplayPropertiesDefinition;
	iconWatermark: string;
	iconWatermarkShelved?: string;
	event?: true;
	expansion?: true;
	season?: number;
	year?: number;
	seasonHash?: number;
	itemHashes?: number[];
	hash: number;
}

export default new DeepsightEndpoint<Record<number, DestinySourceDefinition>>("DestinySourceDefinition.json", {
	process (received) {
		for (const [hash, source] of Object.entries(received))
			source.hash = +hash;
		return received;
	},
});

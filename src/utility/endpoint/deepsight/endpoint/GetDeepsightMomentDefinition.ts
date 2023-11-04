import type { DestinyDisplayPropertiesDefinition, DestinyEventCardDefinition } from "bungie-api-ts/destiny2";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export interface DeepsightMomentDefinition {
	id: string;
	displayProperties: DestinyDisplayPropertiesDefinition;
	iconWatermark?: string;
	iconWatermarkShelved?: string;
	/**
	 * For events, the event card hash. If there isn't an event card, `true`
	 */
	event?: true | number;
	eventCard?: DestinyEventCardDefinition;
	expansion?: true;
	season?: number;
	year?: number;
	seasonHash?: number;
	/**
	 * Items that should be associated with this moment, but aren't according to the Destiny manifest (by icon watermark).
	 * You should render these items with this moment's `iconWatermark`.
	 */
	itemHashes?: number[];
	hash: number;
}

export default new DeepsightEndpoint<Record<number, DeepsightMomentDefinition>>("DeepsightMomentDefinition.json", {
	process (received) {
		for (const [hash, moment] of Object.entries(received))
			moment.hash = +hash;
		return received;
	},
});

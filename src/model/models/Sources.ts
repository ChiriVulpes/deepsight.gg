import Model from "model/Model";
import Manifest from "model/models/manifest/DestinyManifest";
import type { DestinySourceDefinition } from "utility/endpoint/deepsight/endpoint/GetDestinySourceDefinition";

export default Model.createDynamic("Daily", async _ => Manifest.await()
	.then(async manifest => {
		const { DestinySourceDefinition, DestinyEventCardDefinition } = manifest;
		const sources = await DestinySourceDefinition.all();

		const result: DestinySourceDefinition[] = [];
		for (let source of sources) {
			if (typeof source.event === "number") {
				const eventCard = await DestinyEventCardDefinition.get(source.event);
				if (eventCard)
					source = { ...source, eventCard };
			}

			result.push(source);
		}

		result.sort((a, b) => getSortIndex(b) - getSortIndex(a));
		return result;
	}));

function getSortIndex (source: DestinySourceDefinition) {
	// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
	const eventCardEndTime = +source.eventCard?.endTime!;
	if (eventCardEndTime && eventCardEndTime * 1000 > Date.now())
		return Infinity; // current event gets sorted highest

	return source.hash;
}

import Model from "model/Model";
import Manifest from "model/models/Manifest";
import type { DeepsightSourceDefinition } from "utility/endpoint/deepsight/endpoint/GetDeepsightSourceDefinition";

export default Model.createDynamic("Daily", async _ => Manifest.await()
	.then(async manifest => {
		const { DeepsightSourceDefinition, DestinyEventCardDefinition } = manifest;
		const sources = await DeepsightSourceDefinition.all();

		const result: DeepsightSourceDefinition[] = [];
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

function getSortIndex (source: DeepsightSourceDefinition) {
	// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
	const eventCardEndTime = +source.eventCard?.endTime!;
	if (eventCardEndTime && eventCardEndTime * 1000 > Date.now())
		return Infinity; // current event gets sorted highest

	return source.hash;
}

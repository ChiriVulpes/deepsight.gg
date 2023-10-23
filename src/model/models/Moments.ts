import Model from "model/Model";
import Manifest from "model/models/Manifest";
import type { DeepsightMomentDefinition } from "utility/endpoint/deepsight/endpoint/GetDeepsightMomentDefinition";

export default Model.createDynamic("Daily", async _ => Manifest.await()
	.then(async manifest => {
		const { DeepsightMomentDefinition, DestinyEventCardDefinition } = manifest;
		const moments = await DeepsightMomentDefinition.all();

		const result: DeepsightMomentDefinition[] = [];
		for (let moment of moments) {
			if (typeof moment.event === "number") {
				const eventCard = await DestinyEventCardDefinition.get(moment.event);
				if (eventCard)
					moment = { ...moment, eventCard };
			}

			result.push(moment);
		}

		result.sort((a, b) => getSortIndex(b) - getSortIndex(a));
		return result;
	}));

function getSortIndex (moment: DeepsightMomentDefinition) {
	// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
	const eventCardEndTime = +moment.eventCard?.endTime!;
	if (eventCardEndTime && eventCardEndTime * 1000 > Date.now())
		return Infinity; // current event gets sorted highest

	return moment.hash;
}

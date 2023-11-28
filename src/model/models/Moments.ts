import type { DeepsightMomentDefinition } from "@deepsight.gg/interfaces";
import type { DestinyEventCardDefinition } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Manifest from "model/models/Manifest";
import ProfileBatch from "model/models/ProfileBatch";

declare module "@deepsight.gg/interfaces" {
	interface DeepsightMomentDefinition {
		eventCard?: DestinyEventCardDefinition;
	}
}

export default Model.createDynamic("Daily", async _ => Manifest.await()
	.then(async manifest => {
		const { DeepsightMomentDefinition, DestinyEventCardDefinition } = manifest;
		const moments = await DeepsightMomentDefinition.all();
		const profile = await ProfileBatch.await();

		const result: DeepsightMomentDefinition[] = [];
		for (let moment of moments) {
			if (typeof moment.event === "number") {
				const eventCard = await DestinyEventCardDefinition.get(moment.event);
				if (eventCard)
					moment = { ...moment, eventCard };
			}

			result.push(moment);
		}

		result.sort((a, b) => getSortIndex(profile, b) - getSortIndex(profile, a));
		return result;
	}));

function getSortIndex (profile: ProfileBatch, moment: DeepsightMomentDefinition) {
	if (profile?.profile?.data?.activeEventCardHash !== moment.eventCard?.hash)
		return moment.hash;

	// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
	const eventCardEndTime = +moment.eventCard?.endTime!;
	if (eventCardEndTime && eventCardEndTime * 1000 > Date.now())
		return Infinity; // current event gets sorted highest

	return moment.hash;
}

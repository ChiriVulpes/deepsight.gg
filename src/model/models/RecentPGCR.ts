import type { DestinyActivityDefinition, DestinyPostGameCarnageReportData } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Manifest from "model/models/Manifest";
import Async from "utility/Async";
import Time from "utility/Time";
import GetPGCR from "utility/endpoint/bungie/endpoint/destiny2/GetPGCR";

namespace RecentPGCR {
	const RecentID = Model.create("recent pgcr", {
		cache: "Global",
		resetTime: "Daily",
		async generate () {
			let left = 14008975359;
			let right = 137438953470;

			let targetTime = new Date().setUTCHours(17, 0, 0, 0); // Destiny reset time
			if (targetTime > Date.now())
				targetTime -= Time.days(1);

			let attempts = 0;
			while (true) {
				attempts++;
				console.debug("[PGCR Search] Current range:", left, right, "Query count:", attempts);

				const mid = Math.floor((left + right) / 2);
				const response = await GetPGCR.query(mid);

				if ("period" in response) {
					if (new Date(response.period).getTime() > targetTime)
						return mid;

					left = mid + 1;
				} else {
					right = mid - 1;
				}

				if (attempts >= 100) {
					console.error("[PGCR Search] Failed to find a recent PGCR.");
					return undefined;
				}

				await Async.sleep(100);
			}
		},
	});

	/**
	 * Starting at any PGCR created since the daily reset, searches one by one through them to find a match.
	 * @param descriptor A human-readable descriptor
	 * @param filter 
	 * @returns 
	 */
	export async function search (descriptor: string, filter: (activityDef: DestinyActivityDefinition, pgcr: DestinyPostGameCarnageReportData) => any) {
		let id = await RecentID.await();
		if (id === undefined)
			return undefined;

		const { DestinyActivityDefinition } = await Manifest.await();

		let attempts = 0;
		while (true) {
			id++;
			attempts++;
			console.debug(`[PGCR Search] Searching for ${descriptor}. Query count:`, attempts);
			const pgcr = await GetPGCR.query(id);
			if (!("period" in pgcr))
				continue;

			const activityDef = await DestinyActivityDefinition.get(pgcr.activityDetails.referenceId);
			if (!activityDef)
				continue;

			if (filter(activityDef, pgcr)) {
				console.log(`[PGCR Search] Found ${descriptor}:`, activityDef.displayProperties?.name, activityDef, pgcr);
				return { pgcr, activityDef };
			}

			if (attempts >= 500) {
				console.error(`[PGCR Search] Failed to find ${descriptor}...`);
				return undefined;
			}

			await Async.sleep(100);
		}
	}
}

export default RecentPGCR; 
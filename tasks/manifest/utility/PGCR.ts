import type { ActivityTypeHashes } from "@deepsight.gg/enums";
import type { DestinyActivityModeType, DestinyPostGameCarnageReportData, ServerResponse } from "bungie-api-ts/destiny2";
import type { DeepsightManifest, DeepsightManifestReferencePGCR } from "../../../static/manifest/Interfaces";
import Env from "../../utility/Env";
import Log from "../../utility/Log";

const apiKey = Env.DEEPSIGHT_MANIFEST_API_KEY;
if (!apiKey)
	throw new Error("No API key set");

async function sleep (ms: number) {
	return new Promise<void>(resolve => setTimeout(resolve, ms));
}

namespace PGCR {

	const ENDPOINT_PGCR = "https://stats.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport";

	let recentPGCR: DeepsightManifestReferencePGCR | undefined;
	export async function getRecent () {
		return recentPGCR ??= await fetch("https://raw.githubusercontent.com/ChiriVulpes/deepsight.gg/manifest/versions.json")
			.then(response => response.json())
			.then((versions: DeepsightManifest) => versions.referencePostGameCarnageReportSinceDailyReset);
	}

	const pgcrs: (DestinyPostGameCarnageReportData | undefined)[] = [];
	export async function find (id: string, filter: (pgcr: DestinyPostGameCarnageReportData) => any) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		const from = +(await getRecent())?.instanceId!;
		if (!from)
			throw new Error("No reference pgcr");

		for (let i = 0; i < 1000; i++) {
			const pgcrId = from + i;
			Log.info("Searching PGCRs for:", id, "Current:", i);
			let pgcr: DestinyPostGameCarnageReportData | undefined;
			for (let attempt = 0; attempt < 100; attempt++) {
				pgcr = pgcrs[pgcrId] ??= await get(pgcrId).catch(() => undefined);
				if (pgcr) break;
				await sleep(1000 * attempt);
				Log.info("Query failed, attempt", attempt + 1);
			}

			if (!pgcr)
				throw new Error("Either the API is down, or it's Joever");

			if (filter(pgcr))
				return pgcr;

			await sleep(100);
		}

		return undefined;
	}

	export async function findByType (type: ActivityTypeHashes, filter?: (pgcr: DestinyPostGameCarnageReportData) => any) {
		return find(`activity type ${type}`, pgcr => pgcr.activityDetails.referenceId === type && (!filter || filter(pgcr)));
	}
	export async function findByMode (mode: DestinyActivityModeType, filter?: (pgcr: DestinyPostGameCarnageReportData) => any) {
		return find(`activity mode ${mode}`, pgcr => pgcr.activityDetails.modes.includes(mode) && (!filter || filter(pgcr)));
	}

	export async function get (id: number) {
		return fetch(`${ENDPOINT_PGCR}/${id}/`, {
			headers: {
				"X-API-Key": apiKey!,
			},
		})
			.then(response => response.json())
			.then((response: ServerResponse<DestinyPostGameCarnageReportData | undefined>) => response.Response);
	}
}

export default PGCR;

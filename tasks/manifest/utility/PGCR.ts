import type { ActivityTypeHashes } from "@deepsight.gg/enums";
import type { DestinyActivityModeType, DestinyPostGameCarnageReportData, ServerResponse } from "bungie-api-ts/destiny2";
import fs from "fs-extra";
import type { DeepsightManifest, DeepsightManifestReferencePGCR } from "../../../static/manifest/Interfaces";
import Env from "../../utility/Env";
import Log from "../../utility/Log";
import Time from "../../utility/Time";

const apiKey = Env.DEEPSIGHT_MANIFEST_API_KEY;
if (!apiKey)
	throw new Error("No API key set");

async function sleep (ms: number) {
	return new Promise<void>(resolve => setTimeout(resolve, ms));
}

namespace PGCR {

	const ENDPOINT_PGCR = "https://stats.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport";

	let manifest: DeepsightManifest | undefined;
	async function getManifest (): Promise<DeepsightManifest> {
		return manifest ??= (await fs.readJson("manifest/versions.json").catch(() => undefined))
			?? (await fetch("https://raw.githubusercontent.com/ChiriVulpes/deepsight.gg/manifest/versions.json").then(response => response.json()));
	}

	let recentPGCR: DeepsightManifestReferencePGCR | undefined;
	export async function getRecent () {
		return recentPGCR ??= await getManifest()
			.then((versions: DeepsightManifest) => {
				Log.info(`Using reference PGCR from deepsight.gg manifest v${versions.deepsight}`);
				return versions.referencePostGameCarnageReportSinceDailyReset;
			});
	}

	const pgcrs: (DestinyPostGameCarnageReportData | undefined)[] = [];
	export async function find (id: string, filter: (pgcr: DestinyPostGameCarnageReportData) => any) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		const from = +(await getRecent())?.instanceId!;
		if (!from)
			throw new Error("No reference pgcr");

		Log.info("Searching PGCRs starting at:", from);
		const maxSearches = Env.DEEPSIGHT_ENVIRONMENT === "dev" ? 200 : 1000;
		const maxAttempts = Env.DEEPSIGHT_ENVIRONMENT === "dev" ? 5 : 20;
		const parallelSize = 5;
		for (let i = 0; i < maxSearches; i += parallelSize) {
			const pgcrId = from + i;
			Log.info("Searching PGCRs for:", id, "Current:", i);

			const pgcr = await getMulti(pgcrId, parallelSize, maxAttempts, id,
				pgcr => new Date(pgcr.period).getTime() > Time.lastDailyReset && filter(pgcr));
			if (pgcr === undefined)
				return undefined; // only happens in dev

			if (pgcr) {
				Log.info("Gotcha! Using:", pgcrId);
				return pgcr;
			}
		}

		return undefined;
	}

	export async function findByType (type: ActivityTypeHashes, filter?: (pgcr: DestinyPostGameCarnageReportData) => any) {
		return find(`activity type ${type}`, pgcr => pgcr.activityDetails.referenceId === type && (!filter || filter(pgcr)));
	}
	export async function findByMode (mode: DestinyActivityModeType, filter?: (pgcr: DestinyPostGameCarnageReportData) => any) {
		return find(`activity mode ${mode}`, pgcr => pgcr.activityDetails.modes.includes(mode) && (!filter || filter(pgcr)));
	}

	const cache: Partial<Record<number, DestinyPostGameCarnageReportData>> = {};
	export async function get (id: number): Promise<DestinyPostGameCarnageReportData | undefined> {
		return cache[id] ??= await fetch(`${ENDPOINT_PGCR}/${id}/`, {
			headers: {
				"X-API-Key": apiKey!,
			},
		})
			.then(response => response.json())
			.then((response: ServerResponse<DestinyPostGameCarnageReportData | undefined>) => response.Response);
	}

	async function getMulti (pgcrId: number, amount: number, maxAttempts: number, message: string, filter: (pgcr: DestinyPostGameCarnageReportData) => any) {
		let cancelled = false;
		return new Promise<DestinyPostGameCarnageReportData | null | undefined>((resolve, reject) => {
			const promises = [];
			for (let i = 0; i < amount; i++) {
				promises.push(getRetry(pgcrId, maxAttempts, message).then(pgcr => {
					if (cancelled)
						return;

					if (pgcr && filter(pgcr)) {
						cancelled = true;
						resolve(pgcr);
					}
				}).catch(reject));
			}

			void Promise.all(promises).then(() => resolve(null));
		});
	}

	async function getRetry (pgcrId: number, maxAttempts: number, message: string, state = { cancelled: false }) {
		let pgcr: DestinyPostGameCarnageReportData | undefined;
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			pgcr = pgcrs[pgcrId] ??= await get(pgcrId).catch(() => undefined);
			if (pgcr || state.cancelled) break;
			await sleep(1000 * attempt);
			Log.info(message, `query attempt ${attempt + 1} failed`);
		}

		if (!pgcr && !state.cancelled) {
			const error = new Error("Either the API is down, or it's Joever");
			if (Env.DEEPSIGHT_ENVIRONMENT === "dev") {
				Log.error(error.message);
				return undefined;
			}

			throw error;
		}

		return pgcr;
	}
}

export default PGCR;

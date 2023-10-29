import type { DestinyPostGameCarnageReportData, ServerResponse } from "bungie-api-ts/destiny2";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";

export default BungieEndpoint
	.at((activityId: number) =>
		`/Destiny2/Stats/PostGameCarnageReport/${activityId}/`)
	.returning<DestinyPostGameCarnageReportData | ServerResponse<undefined>>()
	.allowErrorStatus("DestinyPGCRNotFound")
	.setSubdomain("stats");

import type { UserInfoCard } from "bungie-api-ts/user";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";

export default BungieEndpoint
	.at("/Destiny2/SearchDestinyPlayerByBungieName/-1/")
	.request((displayName: string, displayNameCode: number) => ({
		method: "POST",
		body: {
			displayName,
			displayNameCode,
		},
	}))
	.returning<UserInfoCard[]>();

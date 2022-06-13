import type { BungieMembershipType, DestinyComponentType, DestinyProfileResponse } from "bungie-api-ts/destiny2";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";

export default BungieEndpoint
	.at((membershipType: BungieMembershipType, destinyMembershipId: string, components: DestinyComponentType[]) =>
		`/Destiny2/${membershipType}/Profile/${destinyMembershipId}/`)
	.request((membershipType, destinyMembershipId, components) => ({
		search: {
			components: components.join(","),
		},
	}))
	.returning<DestinyProfileResponse>();

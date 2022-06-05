import { BungieMembershipType, DestinyComponentType, DestinyProfileResponse } from "bungie-api-ts/destiny2";
import BungieEndpoint from "utility/bungie/BungieEndpoint";

export default BungieEndpoint((membershipType: BungieMembershipType, destinyMembershipId: string, components: DestinyComponentType[]) =>
	`/Destiny2/${membershipType}/Profile/${destinyMembershipId}/`)
	.request((membershipType: BungieMembershipType, destinyMembershipId: string, components: DestinyComponentType[]) => ({
		search: {
			components: components.join(","),
		},
	}))
	.returning<DestinyProfileResponse>();

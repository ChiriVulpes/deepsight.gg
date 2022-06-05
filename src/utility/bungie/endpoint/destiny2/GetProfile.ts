import { BungieMembershipType, DestinyComponentType, DestinyProfileResponse } from "bungie-api-ts/destiny2";
import BungieEndpoint from "utility/bungie/BungieEndpoint";

export default BungieEndpoint((membershipType: BungieMembershipType, destinyMembershipId: string) =>
	`/Destiny2/${membershipType}/Profile/${destinyMembershipId}/`)
	.request(() => ({
		search: {
			components: [DestinyComponentType.ProfileInventories, DestinyComponentType.CharacterInventories].join(","),
		},
	}))
	.returning<DestinyProfileResponse>();

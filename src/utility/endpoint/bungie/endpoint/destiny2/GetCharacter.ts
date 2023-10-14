import type { BungieMembershipType, DestinyCharacterResponse, DestinyComponentType } from "bungie-api-ts/destiny2";
import type { CharacterId } from "model/models/items/Item";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";

export default BungieEndpoint
	.at((membershipType: BungieMembershipType, destinyMembershipId: string, characterId: CharacterId, components: DestinyComponentType[]) =>
		`/Destiny2/${membershipType}/Profile/${destinyMembershipId}/Character/${characterId}/`)
	.request((membershipType, destinyMembershipId, characterId, components) => ({
		search: {
			components: components.join(","),
		},
	}))
	.returning<DestinyCharacterResponse>();

import { getCurrentDestinyMembership } from "model/models/Memberships";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";
import type { EndpointRequest } from "utility/endpoint/Endpoint";

export default BungieEndpoint
	.at("/Destiny2/Actions/Loadouts/EquipLoadout/")
	.request(async (character: `${bigint}`, index: number) => {
		const membership = await getCurrentDestinyMembership();

		return {
			method: "POST",
			body: {
				loadoutIndex: index,
				characterId: character,
				membershipType: membership!.membershipType,
			},
		} as EndpointRequest;
	})
	.endpoint();

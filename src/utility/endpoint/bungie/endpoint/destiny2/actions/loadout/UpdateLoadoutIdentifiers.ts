import { getCurrentDestinyMembership } from "model/models/Memberships";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";
import type { EndpointRequest } from "utility/endpoint/Endpoint";

export interface LoadoutIdentifiers {
	colorHash?: number;
	iconHash?: number;
	nameHash?: number;
}

export default BungieEndpoint
	.at("/Destiny2/Actions/Loadouts/SnapshotLoadout/")
	.request(async (character: `${bigint}`, index: number, identifiers?: LoadoutIdentifiers) => {
		const membership = await getCurrentDestinyMembership();

		return {
			method: "POST",
			body: {
				loadoutIndex: index,
				characterId: character,
				membershipType: membership!.membershipType,
				...identifiers,
			},
		} as EndpointRequest;
	})
	.endpoint();

import { getCurrentDestinyMembership } from "model/models/Memberships";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";
import type { LoadoutIdentifiers } from "utility/endpoint/bungie/endpoint/destiny2/actions/loadout/UpdateLoadoutIdentifiers";
import type { EndpointRequest } from "utility/endpoint/Endpoint";

export interface SnapshotLoadoutOptions extends LoadoutIdentifiers {
}

export default BungieEndpoint
	.at("/Destiny2/Actions/Loadouts/SnapshotLoadout/")
	.request(async (character: `${bigint}`, index: number, options?: SnapshotLoadoutOptions) => {
		const membership = await getCurrentDestinyMembership();

		return {
			method: "POST",
			body: {
				loadoutIndex: index,
				characterId: character,
				membershipType: membership!.membershipType,
				...options,
			},
		} as EndpointRequest;
	})
	.endpoint();

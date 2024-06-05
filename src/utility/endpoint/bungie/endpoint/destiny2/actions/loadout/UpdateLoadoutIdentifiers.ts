import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";
import type { EndpointRequest } from "utility/endpoint/Endpoint";
import Store from "utility/Store";

export interface LoadoutIdentifiers {
	colorHash?: number;
	iconHash?: number;
	nameHash?: number;
}

export default BungieEndpoint
	.at("/Destiny2/Actions/Loadouts/SnapshotLoadout/")
	.request((character: `${bigint}`, index: number, identifiers?: LoadoutIdentifiers) => ({
		method: "POST",
		body: {
			loadoutIndex: index,
			characterId: character,
			membershipType: Store.getProfile()?.data.membershipType,
			...identifiers,
		},
	}) as EndpointRequest)
	.endpoint();

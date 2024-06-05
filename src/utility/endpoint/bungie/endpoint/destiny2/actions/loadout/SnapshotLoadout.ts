import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";
import type { LoadoutIdentifiers } from "utility/endpoint/bungie/endpoint/destiny2/actions/loadout/UpdateLoadoutIdentifiers";
import type { EndpointRequest } from "utility/endpoint/Endpoint";
import ProfileManager from "utility/ProfileManager";

export interface SnapshotLoadoutOptions extends LoadoutIdentifiers {
}

export default BungieEndpoint
	.at("/Destiny2/Actions/Loadouts/SnapshotLoadout/")
	.request((character: `${bigint}`, index: number, options?: SnapshotLoadoutOptions) => ({
		method: "POST",
		body: {
			loadoutIndex: index,
			characterId: character,
			membershipType: ProfileManager.get()?.data.membershipType,
			...options,
		},
	}) as EndpointRequest)
	.endpoint();

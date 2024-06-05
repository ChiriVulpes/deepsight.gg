import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";
import type { EndpointRequest } from "utility/endpoint/Endpoint";
import ProfileManager from "utility/ProfileManager";

export default BungieEndpoint
	.at("/Destiny2/Actions/Loadouts/ClearLoadout/")
	.request((character: `${bigint}`, index: number) => ({
		method: "POST",
		body: {
			loadoutIndex: index,
			characterId: character,
			membershipType: ProfileManager.get()?.data.membershipType,
		},
	}) as EndpointRequest)
	.endpoint();

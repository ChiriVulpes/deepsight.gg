import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";
import type { EndpointRequest } from "utility/endpoint/Endpoint";
import Store from "utility/Store";

export default BungieEndpoint
	.at("/Destiny2/Actions/Loadouts/EquipLoadout/")
	.request((character: `${bigint}`, index: number) => ({
		method: "POST",
		body: {
			loadoutIndex: index,
			characterId: character,
			membershipType: Store.getProfile()?.data.membershipType,
		},
	}) as EndpointRequest)
	.endpoint();

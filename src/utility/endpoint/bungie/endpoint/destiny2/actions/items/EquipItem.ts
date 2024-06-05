import type Item from "model/models/items/Item";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";
import type { EndpointRequest } from "utility/endpoint/Endpoint";
import ProfileManager from "utility/ProfileManager";

export default BungieEndpoint
	.at("/Destiny2/Actions/Items/EquipItem/")
	.request((item: Item, character: `${bigint}`) => {
		return {
			method: "POST",
			body: {
				itemId: item.reference.itemInstanceId,
				characterId: character,
				membershipType: ProfileManager.get()?.data.membershipType,
			},
		} as EndpointRequest;
	})
	.endpoint();

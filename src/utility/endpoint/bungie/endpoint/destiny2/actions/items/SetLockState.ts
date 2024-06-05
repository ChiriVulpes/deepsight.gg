import type Item from "model/models/items/Item";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";
import type { EndpointRequest } from "utility/endpoint/Endpoint";
import Store from "utility/Store";

export default BungieEndpoint
	.at("/Destiny2/Actions/Items/SetLockState/")
	.request((item: Item, locked: boolean) => {
		if (!item.reference.itemInstanceId)
			throw new Error("Item has no instance ID");

		return {
			method: "POST",
			body: {
				state: locked,
				itemId: item.reference.itemInstanceId,
				characterId: item.owner,
				membershipType: Store.getProfile()?.data.membershipType,
			},
		} as EndpointRequest;
	})
	.endpoint();

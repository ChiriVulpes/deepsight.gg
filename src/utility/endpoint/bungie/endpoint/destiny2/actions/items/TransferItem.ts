import type Item from "model/models/items/Item";
import type { CharacterId } from "model/models/items/Item";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";
import type { EndpointRequest } from "utility/endpoint/Endpoint";
import ProfileManager from "utility/ProfileManager";

export default BungieEndpoint
	.at("/Destiny2/Actions/Items/TransferItem/")
	.request((item: Item, character: CharacterId, destination: "vault" | CharacterId = character) => {
		if (!item.reference.itemInstanceId)
			throw new Error("Item has no instance ID");

		return {
			method: "POST",
			body: {
				itemReferenceHash: item.definition.hash,
				stackSize: item.reference.quantity,
				transferToVault: destination === "vault",
				itemId: item.reference.itemInstanceId,
				characterId: destination === "vault" ? character : destination,
				membershipType: ProfileManager.get()?.data.membershipType,
			},
		} as EndpointRequest;
	})
	.endpoint();

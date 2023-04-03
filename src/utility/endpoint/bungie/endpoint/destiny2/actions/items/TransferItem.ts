import type Item from "model/models/items/Item";
import { getCurrentDestinyMembership } from "model/models/Memberships";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";
import type { EndpointRequest } from "utility/endpoint/Endpoint";

export interface Response {
	Response: number;
	ErrorCode: number;
	ThrottleSeconds: number;
	ErrorStatus: string;
	Message: string;
	MessageData: Record<string, string>;
	DetailedErrorTrace: string;
}

export default BungieEndpoint
	.at("/Destiny2/Actions/Items/TransferItem/")
	.request(async (item: Item, character: `${bigint}`, destination: "vault" | `${bigint}` = character) => {
		if (!item.reference.itemInstanceId)
			throw new Error("Item has no instance ID");

		const membership = await getCurrentDestinyMembership();

		return {
			method: "POST",
			body: {
				itemReferenceHash: item.definition.hash,
				stackSize: item.reference.quantity,
				transferToVault: destination === "vault",
				itemId: item.reference.itemInstanceId,
				characterId: destination === "vault" ? character : destination,
				membershipType: membership.membershipType,
			},
		} as EndpointRequest;
	})
	.returning<Response>();

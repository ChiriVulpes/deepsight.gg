import type { DestinyProfileResponse } from "bungie-api-ts/destiny2";
import type { Item } from "model/models/Items";
import { DestinyMembership } from "model/models/Memberships";
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
	.request(async (item: Item, destination: "vault" | `${bigint}`) => {
		if (!item.reference.itemInstanceId)
			throw new Error("Item has no instance ID");

		const membership = await DestinyMembership.await();

		return {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: {
				itemReferenceHash: item.definition.hash,
				stackSize: item.reference.quantity,
				transferToVault: destination === "vault",
				itemId: item.reference.itemInstanceId,
				characterId: destination,
				membershipType: membership.membershipType,
			},
		} as EndpointRequest;
	})
	.returning<DestinyProfileResponse>();

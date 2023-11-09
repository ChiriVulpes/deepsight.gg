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
	.at("/Destiny2/Actions/Items/SetLockState/")
	.request(async (item: Item, locked: boolean) => {
		if (!item.reference.itemInstanceId)
			throw new Error("Item has no instance ID");

		const membership = await getCurrentDestinyMembership();

		return {
			method: "POST",
			body: {
				state: locked,
				itemId: item.reference.itemInstanceId,
				characterId: item.owner,
				membershipType: membership!.membershipType,
			},
		} as EndpointRequest;
	})
	.returning<Response>();

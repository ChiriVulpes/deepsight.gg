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
	.at("/Destiny2/Actions/Items/EquipItem/")
	.request(async (item: Item, character: `${bigint}`) => {
		const membership = await DestinyMembership.await();

		return {
			method: "POST",
			body: {
				itemId: item.reference.itemInstanceId,
				characterId: character,
				membershipType: membership.membershipType,
			},
		} as EndpointRequest;
	})
	.returning<Response>();

import type { BungieMembershipType, DestinyComponentType, DestinyVendorResponse } from "bungie-api-ts/destiny2";
import type { CharacterId } from "model/models/items/Item";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";

export const enum VendorHashes {
	CommanderZavala = 2232145065,
	Saint14 = 502095006,
}

export default BungieEndpoint
	.at((membershipType: BungieMembershipType, destinyMembershipId: string, characterId: CharacterId, vendorHash: VendorHashes, components: DestinyComponentType[]) =>
		`/Destiny2/${membershipType}/Profile/${destinyMembershipId}/Character/${characterId}/Vendors/${vendorHash}/`)
	.request((membershipType, destinyMembershipId, characterId, vendorHash, components) => ({
		search: {
			components: components.join(","),
		},
	}))
	.returning<DestinyVendorResponse>();

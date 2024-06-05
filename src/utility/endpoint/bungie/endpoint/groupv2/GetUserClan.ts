import type { BungieMembershipType } from "bungie-api-ts/destiny2";
import type { GetGroupsForMemberResponse } from "bungie-api-ts/groupv2";
import { GroupType, GroupsForMemberFilter } from "bungie-api-ts/groupv2";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";

export default BungieEndpoint
	.at((membershipType: BungieMembershipType, destinyMembershipId: string, filter = GroupsForMemberFilter.All) =>
		`/GroupV2/User/${membershipType}/${destinyMembershipId}/${filter}/${GroupType.Clan}/`)
	.returning<GetGroupsForMemberResponse>();

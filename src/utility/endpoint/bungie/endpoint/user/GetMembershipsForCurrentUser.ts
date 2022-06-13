import type { UserMembershipData } from "bungie-api-ts/user";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";

export default BungieEndpoint
	.at("/User/GetMembershipsForCurrentUser/")
	.returning<UserMembershipData>();

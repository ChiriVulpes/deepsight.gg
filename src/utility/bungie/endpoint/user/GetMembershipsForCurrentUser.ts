import { UserMembershipData } from "bungie-api-ts/user";
import BungieEndpoint from "utility/bungie/BungieEndpoint";

export default BungieEndpoint("/User/GetMembershipsForCurrentUser/")
	.returning<UserMembershipData>();

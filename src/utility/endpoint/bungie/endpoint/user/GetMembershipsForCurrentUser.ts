import type { UserMembershipData } from "bungie-api-ts/user";
import type { IProfileStorage } from "utility/Store";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";

export default BungieEndpoint
	.at((profile: IProfileStorage) => "/User/GetMembershipsForCurrentUser/")
	.returning<UserMembershipData>()
	.setProfile(profile => profile);

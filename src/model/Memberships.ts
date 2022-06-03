import Model from "model/Model";
import GetMembershipsForCurrentUser, { IBungieUserMembershipData } from "utility/bungie/endpoint/user/GetMembershipsForCurrentUser";

export default new Model<IBungieUserMembershipData>("memberships", {
	resetTime: "Daily",
	generate: () => GetMembershipsForCurrentUser.query(),
});

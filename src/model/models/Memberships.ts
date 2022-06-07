import Model from "model/Model";
import GetMembershipsForCurrentUser from "utility/bungie/endpoint/user/GetMembershipsForCurrentUser";

export default Model.create("memberships", {
	cache: "Session",
	resetTime: "Daily",
	generate: () => GetMembershipsForCurrentUser.query(),
});

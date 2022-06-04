import Model from "model/Model";
import GetMembershipsForCurrentUser from "utility/bungie/endpoint/user/GetMembershipsForCurrentUser";

export default new Model("memberships", {
	resetTime: "Daily",
	generate: () => GetMembershipsForCurrentUser.query(),
});

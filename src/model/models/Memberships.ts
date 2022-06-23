import Model from "model/Model";
import GetMembershipsForCurrentUser from "utility/endpoint/bungie/endpoint/user/GetMembershipsForCurrentUser";

const Memberships = Model.create("memberships", {
	cache: "Session",
	resetTime: "Daily",
	generate: () => GetMembershipsForCurrentUser.query(),
});

export default Memberships;

export const DestinyMembership = Model.create("destiny membership", {
	cache: false,
	resetTime: "Daily",
	generate: async () => {
		const membership = await Memberships.await();
		const destinyMembership = membership.destinyMemberships[0];
		if (!destinyMembership)
			throw new Error("No Destiny membership");

		return destinyMembership;
	},
});

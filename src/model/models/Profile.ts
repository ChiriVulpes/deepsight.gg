import Model from "model/Model";
import Memberships from "model/models/Memberships";
import GetProfile from "utility/bungie/endpoint/destiny2/GetProfile";
import Time from "utility/Time";

export default new Model("profile", {
	resetTime: Time.minutes(1),
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	generate: async () => {
		const membership = await Memberships.await();
		const destinyMembership = membership.destinyMemberships[0];
		if (!destinyMembership)
			throw new Error("No Destiny membership");

		return GetProfile.query(destinyMembership.membershipType, destinyMembership.membershipId);
	},
});

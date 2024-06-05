import type { UserInfoCard } from "bungie-api-ts/user";
import type { IProfileStorage } from "utility/Store";
import Store from "utility/Store";
import GetMembershipsForCurrentUser from "utility/endpoint/bungie/endpoint/user/GetMembershipsForCurrentUser";

namespace Memberships {

	export async function getCurrentDestinyMembership (profile: IProfileStorage | undefined = Store.getProfile()?.data) {
		if (!profile?.accessToken)
			return undefined;

		const memberships = await GetMembershipsForCurrentUser.query(profile);
		if (profile.membershipType !== undefined) {
			const membership = memberships.destinyMemberships.find(membership => membership.membershipType === profile.membershipType);
			if (membership)
				return membership;
		}

		return getPrimaryDestinyMembership(memberships.destinyMemberships);
	}

	export function getPrimaryDestinyMembership<CARD extends UserInfoCard = UserInfoCard> (memberships: CARD[]): CARD {
		const firstMembership = memberships[0];
		if (!firstMembership?.crossSaveOverride)
			return firstMembership;

		return memberships.find(membership => membership.membershipType === firstMembership.crossSaveOverride)
			?? firstMembership;
	}

}

export default Memberships;

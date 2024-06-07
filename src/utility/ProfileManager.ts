import { DestinyComponentType } from "bungie-api-ts/destiny2";
import type { UserInfoCard } from "bungie-api-ts/user";
import Memberships from "model/models/Memberships";
import BungieID from "utility/BungieID";
import type { IProfile, IProfileStorage } from "utility/Store";
import Store from "utility/Store";
import GetProfile from "utility/endpoint/bungie/endpoint/destiny2/GetProfile";
import SearchDestinyPlayerByBungieName from "utility/endpoint/bungie/endpoint/destiny2/SearchDestinyPlayerByBungieName";
import GetUserClan from "utility/endpoint/bungie/endpoint/groupv2/GetUserClan";

namespace ProfileManager {

	export function isAuthenticated () {
		return !!get()?.data.accessToken;
	}

	export function byId (bungieId: BungieID | string): IProfileStorage | undefined {
		if (typeof bungieId === "object")
			bungieId = BungieID.stringify(bungieId);

		return (Store.items.profiles ?? {})[bungieId];
	}

	export function get (): IProfile | undefined {
		const selectedProfileId = Store.items.selectedProfile;
		if (!selectedProfileId) {
			const profiles = Object.entries(Store.items.profiles ?? {});
			const authenticatedProfiles = profiles.filter(([, profile]) => profile.accessToken);

			if (!profiles.length || authenticatedProfiles.length > 1 || (!authenticatedProfiles.length && profiles.length > 1))
				return undefined;

			const [idString, data] = authenticatedProfiles[0] ?? profiles[0];

			const id = BungieID.parse(idString);
			if (!id || !data)
				return undefined;

			return { id, data };
		}

		const data = Store.items.profiles?.[selectedProfileId];
		if (!data)
			return undefined;

		const id = BungieID.parse(selectedProfileId);
		if (!id)
			return undefined;

		return { id, data };
	}

	export function update (bungieId: BungieID | string, profile: Partial<IProfileStorage> = {}) {
		if (typeof bungieId === "object")
			bungieId = BungieID.stringify(bungieId);

		const profiles = Store.items.profiles ?? {};
		profile = profiles[bungieId] = {
			...profiles[bungieId],
			...profile,
			lastModified: new Date().toISOString(),
		};
		Store.items.profiles = profiles;
		return profile as IProfileStorage;
	}

	export function remove (bungieId: BungieID | string) {
		if (typeof bungieId === "object")
			bungieId = BungieID.stringify(bungieId);

		const profiles = Store.items.profiles ?? {};
		delete profiles[bungieId];
		Store.items.profiles = profiles;
	}

	let reinitPromise: Promise<IProfileStorage | undefined> | undefined;
	export async function reinit (bungieId: BungieID | string) {
		while (reinitPromise)
			await reinitPromise;

		const result = await (reinitPromise = reinitInternal(bungieId));
		reinitPromise = undefined;
		return result;
	}
	async function reinitInternal (bungieId: BungieID | string) {
		if (typeof bungieId === "object")
			bungieId = BungieID.stringify(bungieId);

		const profiles = Store.items.profiles ?? {};
		let storeProfile: IProfileStorage | undefined = profiles[bungieId] = {
			...profiles[bungieId],
			lastModified: new Date().toISOString(),
		};

		let membership: UserInfoCard | undefined;
		if (storeProfile.accessToken)
			membership = await Memberships.getCurrentDestinyMembership(storeProfile);
		else {
			const id = BungieID.parse(bungieId);
			membership = id && await SearchDestinyPlayerByBungieName.query(id.name, id.code)
				.then(memberships => Memberships.getPrimaryDestinyMembership(memberships));
		}

		if (!membership) {
			delete profiles[bungieId];
			Store.items.profiles = profiles;
			return undefined;
		}

		const oldIdString = bungieId;

		bungieId = { name: membership.bungieGlobalDisplayName, code: membership.bungieGlobalDisplayNameCode ?? 0 };
		const idString = BungieID.stringify(bungieId);

		if (idString !== oldIdString)
			delete profiles[oldIdString];

		storeProfile = profiles[idString] = {
			...storeProfile,
			membershipType: membership.membershipType,
			membershipId: membership.membershipId,
		};

		const profile = await GetProfile
			.setOptionalAuth(true)
			.query(membership.membershipType, membership.membershipId, [DestinyComponentType.Profiles, DestinyComponentType.Characters]);

		const currentCharacter = Object.values(profile.characters.data ?? {})
			?.sort(({ dateLastPlayed: dateLastPlayedA }, { dateLastPlayed: dateLastPlayedB }) =>
				new Date(dateLastPlayedB).getTime() - new Date(dateLastPlayedA).getTime())
			?.[0];

		const clan = await GetUserClan.query(membership.membershipType, membership.membershipId);

		storeProfile.emblemHash = currentCharacter?.emblemHash;
		storeProfile.class = currentCharacter?.classType;
		storeProfile.callsign = clan?.results?.[0]?.group?.clanInfo?.clanCallsign ?? "";
		storeProfile.callsignLastModified = new Date().toISOString();

		Store.items.profiles = profiles;
		return storeProfile;
	}
}

Object.assign(window, { ProfileManager });
export default ProfileManager;

import type { DestinyProfileResponse, ServerResponse } from "../../src/node_modules/bungie-api-ts/destiny2";
import { DestinyComponentType } from "../../src/node_modules/bungie-api-ts/destiny2";

type PromiseOr<T> = T | Promise<T>;

namespace DestinyProfile {

	const components = [
		DestinyComponentType.Profiles,
		DestinyComponentType.VendorReceipts,
		DestinyComponentType.ProfileInventories,
		DestinyComponentType.ProfileCurrencies,
		DestinyComponentType.ProfileProgression,
		DestinyComponentType.PlatformSilver,
		DestinyComponentType.Characters,
		DestinyComponentType.CharacterInventories,
		DestinyComponentType.CharacterProgressions,
		DestinyComponentType.CharacterRenderData,
		DestinyComponentType.CharacterActivities,
		DestinyComponentType.CharacterEquipment,
		DestinyComponentType.CharacterLoadouts,
		DestinyComponentType.ItemInstances,
		DestinyComponentType.ItemObjectives,
		DestinyComponentType.ItemPerks,
		DestinyComponentType.ItemRenderData,
		DestinyComponentType.ItemStats,
		DestinyComponentType.ItemSockets,
		DestinyComponentType.ItemTalentGrids,
		DestinyComponentType.ItemCommonData,
		DestinyComponentType.ItemPlugStates,
		DestinyComponentType.ItemPlugObjectives,
		DestinyComponentType.ItemReusablePlugs,
		DestinyComponentType.Vendors,
		DestinyComponentType.VendorCategories,
		DestinyComponentType.VendorSales,
		DestinyComponentType.Kiosks,
		DestinyComponentType.CurrencyLookups,
		DestinyComponentType.PresentationNodes,
		DestinyComponentType.Collectibles,
		DestinyComponentType.Records,
		DestinyComponentType.Transitory,
		DestinyComponentType.Metrics,
		DestinyComponentType.StringVariables,
		DestinyComponentType.Craftables,
		DestinyComponentType.SocialCommendations,
	];

	const accessToken = process.env.DEEPSIGHT_MANIFEST_USER_ACCESS_TOKEN;
	const membershipId = process.env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_ID;
	const membershipType = process.env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_TYPE;
	const apiKey = process.env.DEEPSIGHT_MANIFEST_API_KEY;

	let profile: PromiseOr<DestinyProfileResponse> | undefined;
	export function get (): PromiseOr<DestinyProfileResponse> {
		if (profile)
			return profile;

		return profile ??= fetch(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components.join(",")}`, {
			headers: {
				"X-API-Key": apiKey!,
				Authorization: `Bearer ${accessToken}`,
			},
		})
			.then(response => response.json())
			.then((response: ServerResponse<DestinyProfileResponse>) => {
				if (!response.Response)
					throw new Error("Unable to fetch user profile for manifest");

				return profile = response.Response;
			});
	}
}

interface DestinyProfile {
	get (hash?: number | string): PromiseOr<DestinyProfileResponse>;
}

export default DestinyProfile;

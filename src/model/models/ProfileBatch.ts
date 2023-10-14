import { DestinyComponentType } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Profile from "model/models/Profile";
import Time from "utility/Time";

const allComponentTypes = [
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

allComponentTypes;

export default Model.createDynamic(Time.seconds(30), async () => {
	const ProfileQuery = Profile(
		// Characters
		DestinyComponentType.Characters,
		DestinyComponentType.ProfileProgression,

		// Items
		DestinyComponentType.CharacterInventories,
		DestinyComponentType.CharacterEquipment,
		DestinyComponentType.ProfileInventories,
		DestinyComponentType.ItemInstances,
		DestinyComponentType.ItemPlugObjectives,
		DestinyComponentType.ItemStats,
		DestinyComponentType.Records,
		DestinyComponentType.ItemSockets,
		DestinyComponentType.ItemReusablePlugs,
		DestinyComponentType.ItemPlugStates,
		DestinyComponentType.ItemPerks,
		DestinyComponentType.CharacterProgressions,

		// Collections
		DestinyComponentType.Collectibles,

		// Misc
		DestinyComponentType.StringVariables,

		// ...allComponentTypes,
	);

	const profile = await ProfileQuery.await();

	// const membership = await getCurrentDestinyMembership();
	// const characters = await Promise.all(Object.keys(profile.characters?.data ?? Objects.EMPTY)
	// 	.map(characterId => GetCharacter.query(membership.membershipType, membership.membershipId, characterId as CharacterId, [
	// 		...allComponentTypes,
	// 	])));
	// console.log(characters);

	return profile;
});

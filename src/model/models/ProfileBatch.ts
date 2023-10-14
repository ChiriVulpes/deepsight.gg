import { DestinyComponentType } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Profile from "model/models/Profile";
import Time from "utility/Time";

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

		// Collections
		DestinyComponentType.Collectibles,
	);

	return ProfileQuery.await();
});

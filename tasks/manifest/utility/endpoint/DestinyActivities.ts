import Model from "../../../utility/Model";
import DestinyManifest from "./DestinyManifest";
import DestinyProfile from "./DestinyProfile";

export default Model(async () => {
	const profile = await DestinyProfile.get();
	return Promise.all(Object.values(profile?.characterActivities.data ?? {})
		.flatMap(activities => activities.availableActivities)
		.map(async activity => ({
			activity,
			definition: await DestinyManifest.DestinyActivityDefinition.get(activity.activityHash),
		})));
});
